import { ConfigModule } from '@nestjs/config';

export const TestConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [
    () => ({
      MONGODB_URI: 'mongodb://localhost:27017/nna-registry-test',
      JWT_SECRET: 'test-secret',
      GCP_PROJECT_ID: 'test-project',
      GCP_BUCKET_NAME: 'test-bucket',
      NODE_ENV: 'test',
    }),
  ],
}); 