import { Injectable } from '@nestjs/common';

export interface Product {
  sku: string;
  name: string;
  category: 'keyboard' | 'mouse' | 'headset';
  /** In euros. */
  price: number;
}

/** In memory, where your app would use TypeORM, Prisma or an HTTP client. */
@Injectable()
export class ProductsRepository {
  private readonly rows: Product[] = [
    {
      sku: 'KB-101',
      name: 'K2 mechanical keyboard',
      category: 'keyboard',
      price: 89,
    },
    {
      sku: 'KB-205',
      name: 'Silent office keyboard',
      category: 'keyboard',
      price: 39,
    },
    { sku: 'MS-310', name: 'Wireless mouse', category: 'mouse', price: 25 },
    {
      sku: 'HS-420',
      name: 'Noise-cancelling headset',
      category: 'headset',
      price: 129,
    },
  ];

  // Kept apart from the catalog, as an inventory system would.
  private readonly units = new Map([
    ['KB-101', 12],
    ['KB-205', 0],
    ['MS-310', 40],
    ['HS-420', 5],
  ]);

  async search(criteria: {
    query: string;
    category?: Product['category'];
    maxPrice?: number;
  }): Promise<Product[]> {
    const words = criteria.query.toLowerCase().split(/\s+/);

    return this.rows
      .filter((row) =>
        words.some((word) => row.name.toLowerCase().includes(word)),
      )
      .filter(
        (row) =>
          criteria.category === undefined || row.category === criteria.category,
      )
      .filter(
        (row) =>
          criteria.maxPrice === undefined || row.price <= criteria.maxPrice,
      )
      .sort((a, b) => a.price - b.price);
  }

  async stockOf(sku: string): Promise<number | undefined> {
    return this.units.get(sku);
  }
}
