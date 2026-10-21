import { Body, Controller, Post } from '@nestjs/common';
import { Agent } from 'nestjs-langchain';

@Controller('ask')
export class AskController {
  constructor(private readonly agent: Agent) {}

  @Post()
  async ask(@Body('question') question: string): Promise<string> {
    const { output } = await this.agent.run(question);
    return output;
  }
}
