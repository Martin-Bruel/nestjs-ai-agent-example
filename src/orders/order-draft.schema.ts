import { z } from 'zod';

export const OrderDraft = z.object({
  sku: z.string().describe('The SKU of the product in the catalog.'),
  quantity: z.number().int().positive(),
});

export type OrderDraft = z.infer<typeof OrderDraft>;
