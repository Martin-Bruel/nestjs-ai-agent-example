import { Test, TestingModule } from '@nestjs/testing';
import { AIMessage } from '@langchain/core/messages';
import { fakeModel } from '@langchain/core/testing';
import { LangChainModule } from 'nestjs-langchain';
import { AskController } from './ask.controller.js';

describe('AskController', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    await moduleRef.close();
  });

  it('answers with the output of the agent and the tools it called', async () => {
    // Replays an answer: no API key, no network.
    const model = fakeModel().respond(
      new AIMessage('Nest creates your dependencies and passes them in.'),
    );

    moduleRef = await Test.createTestingModule({
      imports: [LangChainModule.register({ model })],
      controllers: [AskController],
    }).compile();
    // The agent is built on init, which `compile()` does not run.
    await moduleRef.init();

    const answer = await moduleRef
      .get(AskController)
      .ask('What is dependency injection?');

    expect(answer).toEqual({
      output: 'Nest creates your dependencies and passes them in.',
      tools: [],
    });
    expect(model.calls[0].messages.at(-1)?.text).toBe(
      'What is dependency injection?',
    );
  });
});
