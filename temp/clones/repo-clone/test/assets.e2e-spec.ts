import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/user.schema';
import { Asset } from '../src/models/asset.schema';
import { AppModule } from '../src/app.module';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Mock the StorageService to avoid actual GCP uploads
jest.mock('../src/modules/storage/storage.service', () => {
  return {
    StorageService: jest.fn().mockImplementation(() => {
      return {
        uploadFile: jest.fn().mockImplementation(() => {
          return Promise.resolve(
            'https://storage.googleapis.com/mock-bucket/test-file.mp3',
          );
        }),
        deleteFile: jest.fn().mockImplementation(() => {
          return Promise.resolve();
        }),
      };
    }),
  };
});

describe('AssetsController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let assetModel: Model<Asset>;
  let mongoMemoryServer: MongoMemoryServer;
  let userToken: string;
  let adminToken: string;
  let createdAssetName: string;

  const testUser = {
    email: 'user@example.com',
    password: 'Password123',
    username: 'testUser',
  };

  const adminUser = {
    email: 'admin@example.com',
    password: 'Password123',
    role: 'admin',
    username: 'admin',
  };

  const testAsset = {
    layer: 'G',
    category: 'Pop',
    subcategory: 'Swift_Inspired',
    source: 'ReViz',
    tags: ['pop', 'taylor swift'],
    description: 'A pop song by Taylor Swift',
  };

  const updatedAsset = {
    description: 'Updated pop song description',
    tags: ['pop', 'taylor swift', 'remix'],
  };

  // Create a mock file buffer
  const testFileBuffer = Buffer.from('mock file content');

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    process.env.MONGODB_URI = uri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    assetModel = moduleFixture.get<Model<Asset>>(getModelToken(Asset.name));

    // Create test users
    const user = new userModel(testUser);
    await user.save();

    const admin = new userModel(adminUser);
    await admin.save();

    // Login as user and admin to get tokens
    const userResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    userToken = userResponse.body.data.token;

    const adminResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminResponse.body.data.token;
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoMemoryServer.stop();
  });

  describe('Asset Management Flow', () => {
    it('POST /assets - should create a new asset', async () => {
      return request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${userToken}`)
        .field('layer', testAsset.layer)
        .field('category', testAsset.category)
        .field('subcategory', testAsset.subcategory)
        .field('source', testAsset.source)
        .field('tags', JSON.stringify(testAsset.tags))
        .field('description', testAsset.description)
        .attach('file', testFileBuffer, 'test-file.mp3')
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.layer).toEqual(testAsset.layer);
          expect(res.body.data.category).toEqual(testAsset.category);
          expect(res.body.data.subcategory).toEqual(testAsset.subcategory);
          expect(res.body.data.name).toBeDefined();
          expect(res.body.data.nna_address).toBeDefined();
          expect(res.body.data.gcpStorageUrl).toEqual(
            'https://storage.googleapis.com/mock-bucket/test-file.mp3',
          );

          createdAssetName = res.body.data.name;
        });
    });

    it('GET /assets/:name - should get an asset by name', async () => {
      return request(app.getHttpServer())
        .get(`/assets/${createdAssetName}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toEqual(createdAssetName);
          expect(res.body.data.layer).toEqual(testAsset.layer);
          expect(res.body.data.category).toEqual(testAsset.category);
          expect(res.body.data.subcategory).toEqual(testAsset.subcategory);
        });
    });

    it('PUT /assets/:name - should update an asset', async () => {
      return request(app.getHttpServer())
        .put(`/assets/${createdAssetName}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedAsset)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toEqual(createdAssetName);
          expect(res.body.data.description).toEqual(updatedAsset.description);
          expect(res.body.data.tags).toEqual(
            expect.arrayContaining(updatedAsset.tags),
          );
        });
    });

    it('POST /assets/curate/:name - should require admin role for curation', async () => {
      return request(app.getHttpServer())
        .post(`/assets/curate/${createdAssetName}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('POST /assets/curate/:name - should curate an asset with admin role', async () => {
      return request(app.getHttpServer())
        .post(`/assets/curate/${createdAssetName}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toEqual(createdAssetName);
        });
    });

    it('DELETE /assets/:name - should require admin role for deletion', async () => {
      return request(app.getHttpServer())
        .delete(`/assets/${createdAssetName}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('DELETE /assets/:name - should delete an asset with admin role', async () => {
      return request(app.getHttpServer())
        .delete(`/assets/${createdAssetName}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toContain(createdAssetName);
        });
    });
  });
});
