// src/modules/taxonomy/taxonomy.module.ts
import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Module({
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}