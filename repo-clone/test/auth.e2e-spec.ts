import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/user.schema';
import { AppModule } from '../src/app.module';
import * as mongoose from 'mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let mongoMemoryServer: MongoMemoryServer;
  let jwtToken: string;
  const testUser = {
    email: 'test@example.com',
    password: 'Password123',
    username: 'testUser',
  };
  const adminUser = {
    email: 'admin@example.com',
    password: 'Password123',
    role: 'admin',
    username: 'admin',
  };

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
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoMemoryServer.stop();
  });

  describe('Authentication Flow', () => {
    it('/auth/register (POST) - should register a new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.token).toBeDefined();
          jwtToken = res.body.data.token;
        });
    });

    it('/auth/register (POST) - should fail with existing email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('/auth/login (POST) - should login and return a token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.token).toBeDefined();
          jwtToken = res.body.data.token;
        });
    });

    it('/auth/login (POST) - should fail with incorrect credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(401);
    });

    it('/auth/profile (GET) - should return user profile when authenticated', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toEqual(testUser.email);
          expect(res.body.data.role).toEqual('editor');
          expect(res.body.data.password).toBeUndefined();
        });
    });

    it('/auth/profile (GET) - should fail without authentication', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('/auth/make-admin (POST) - should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .post('/auth/make-admin')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ email: 'another@example.com' })
        .expect(403);
    });

    it('should create an admin user and promote another user to admin', async () => {
      // First create an admin user directly in the database
      const admin = new userModel(adminUser);
      await admin.save();

      // Login as admin
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: adminUser.email, password: adminUser.password })
        .expect(201);

      const adminToken = loginResponse.body.data.token;

      // Use admin token to make test user an admin
      return request(app.getHttpServer())
        .post('/auth/make-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: testUser.email })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toEqual(testUser.email);
          expect(res.body.data.role).toEqual('admin');
        });
    });
  });
});
