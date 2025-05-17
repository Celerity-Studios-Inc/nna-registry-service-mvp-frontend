import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo() {
    return {
      name: 'NNA Registry Service API',
      version: '1.0.0',
      docs: '/api/docs',
      status: 'running'
    };
  }
}
