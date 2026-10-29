import { Module } from '@nestjs/common';
import { LangChainModule } from 'nestjs-langchain';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AskController } from './ask.controller.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { OrdersController } from './orders/orders.controller.js';

@Module({
  imports: [
    CatalogModule,
    LangChainModule.register({
      // `provider:model`; the provider reads OPENAI_API_KEY.
      model: { model: 'openai:gpt-5-mini' },
      systemPrompt: 'You sell computer accessories. Answer from the catalog.',
      tools: [CatalogModule],
    }),
  ],
  controllers: [AppController, AskController, OrdersController],
  providers: [AppService],
})
export class AppModule {}
