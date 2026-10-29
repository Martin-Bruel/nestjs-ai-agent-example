import {
  Body,
  Controller,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Agent, StructuredOutputError } from 'nestjs-langchain';
import { OrderDraft } from './order-draft.schema.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly agent: Agent) {}

  @Post('draft')
  async draft(@Body('message') message: string): Promise<OrderDraft> {
    try {
      const { output } = await this.agent.run(
        `Find the product of this customer message in the catalog, then draft the order.\n\n${message}`,
        { output: OrderDraft },
      );
      return output;
    } catch (error) {
      if (error instanceof StructuredOutputError) {
        throw new UnprocessableEntityException(
          'Could not draft an order from this message.',
        );
      }
      throw error;
    }
  }
}
