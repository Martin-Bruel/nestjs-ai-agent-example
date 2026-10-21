import { Module } from '@nestjs/common';
import { LangChainModule } from 'nestjs-langchain';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AskController } from './ask.controller.js';

@Module({
  imports: [
    LangChainModule.register({
      // `provider:model`; the provider reads OPENAI_API_KEY.
      model: { model: 'openai:gpt-5-mini' },
      systemPrompt: 'You are a helpful assistant. Answer in one paragraph.',
    }),
  ],
  controllers: [AppController, AskController],
  providers: [AppService],
})
export class AppModule {}
