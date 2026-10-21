import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { ProductsRepository } from './products.repository.js';

@Module({
  providers: [CatalogService, ProductsRepository],
})
export class CatalogModule {}
