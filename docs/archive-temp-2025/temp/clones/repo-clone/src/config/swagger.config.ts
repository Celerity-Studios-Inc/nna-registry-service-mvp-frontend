// src/config/swagger.config.ts
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('NNA Registry Service API')
  .setDescription('API for managing digital assets in the NNA Framework')
  .setVersion('1.0')
  .addBearerAuth()
  .build();