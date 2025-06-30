import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { AssetsModule } from './modules/assets/assets.module';
import { StorageModule } from './modules/storage/storage.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { SentryService } from './config/sentry.config';
import { mongooseConfig } from './config/mongodb.config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      cache: true 
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mongooseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    AssetsModule,
    StorageModule,
    TaxonomyModule,
  ],
  providers: [
    SentryService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
