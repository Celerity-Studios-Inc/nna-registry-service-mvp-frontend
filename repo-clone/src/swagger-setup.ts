/**
 * This script generates Swagger documentation for the NNA Registry Service API.
 * It's intended to be run before starting the application in development mode.
 */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';

async function generateDocs() {
  const app = await NestFactory.create(AppModule);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // Ensure the dist directory exists
  const outputDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the Swagger JSON file
  fs.writeFileSync(
    path.resolve(outputDir, 'swagger.json'),
    JSON.stringify(document, null, 2),
    { encoding: 'utf8' }
  );
  
  console.log(`Swagger documentation generated at ${path.resolve(outputDir, 'swagger.json')}`);
  
  await app.close();
}

// Generate the documentation
generateDocs().catch(error => {
  console.error('Error generating Swagger documentation:', error);
  process.exit(1);
});