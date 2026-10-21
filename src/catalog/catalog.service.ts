import { Injectable } from '@nestjs/common';
import { Tool, ToolParam } from 'nestjs-langchain';
import { z } from 'zod';
import { Product, ProductsRepository } from './products.repository.js';

const Category = z.enum(['keyboard', 'mouse', 'headset']);

@Injectable()
export class CatalogService {
  constructor(private readonly products: ProductsRepository) {}

  @Tool({ description: 'Returns how many units of a product are in stock.' })
  async checkStock(
    @ToolParam({
      name: 'sku',
      description: 'The product reference, such as KB-101.',
    })
    sku: string,
  ): Promise<number> {
    const stock = await this.products.stockOf(sku);
    if (stock === undefined) {
      throw new Error(`No product with SKU ${sku}.`);
    }
    return stock;
  }

  @Tool({ description: 'Searches the catalog by name, cheapest first.' })
  searchProducts(
    @ToolParam({ name: 'query', description: 'Words of the product name.' })
    query: string,
    @ToolParam({ name: 'category', schema: Category, optional: true })
    category?: z.infer<typeof Category>,
    @ToolParam({
      name: 'maxPrice',
      description: 'The highest price, in euros.',
      schema: z.number().positive(),
      optional: true,
    })
    maxPrice?: number,
  ): Promise<Product[]> {
    return this.products.search({ query, category, maxPrice });
  }
}
