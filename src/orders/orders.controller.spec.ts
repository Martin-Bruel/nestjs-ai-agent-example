import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { fakeModel } from '@langchain/core/testing';
import { LangChainModule } from 'nestjs-langchain';
import { CatalogModule } from '../catalog/catalog.module.js';
import { OrdersController } from './orders.controller.js';

// The tool nestjs-langchain gives the model for its answer, when a run has an
// `output` schema.
const ANSWER = 'extract-output';

describe('OrdersController', () => {
  let moduleRef: TestingModule;

  // The real catalog tools, and a model that replays the tool calls it is
  // given: no API key, no network.
  const controllerWith = async (model: ReturnType<typeof fakeModel>) => {
    moduleRef = await Test.createTestingModule({
      imports: [
        CatalogModule,
        LangChainModule.register({ model, tools: [CatalogModule] }),
      ],
      controllers: [OrdersController],
    }).compile();
    // The agent is built on init, which `compile()` does not run.
    await moduleRef.init();
    return moduleRef.get(OrdersController);
  };

  afterEach(async () => {
    await moduleRef.close();
  });

  it('drafts a typed order from a customer message', async () => {
    const model = fakeModel()
      .respondWithTools([{ name: 'searchProducts', args: { query: 'K2' } }])
      .respondWithTools([
        { name: ANSWER, args: { sku: 'KB-101', quantity: 2 } },
      ]);

    const controller = await controllerWith(model);
    const draft = await controller.draft('Two K2 keyboards, please.');

    expect(draft).toEqual({ sku: 'KB-101', quantity: 2 });
  });

  it('sends an answer that breaks the schema back to the model', async () => {
    const model = fakeModel()
      .respondWithTools([
        { name: ANSWER, args: { sku: 'KB-101', quantity: 'two' } },
      ])
      .respondWithTools([
        { name: ANSWER, args: { sku: 'KB-101', quantity: 2 } },
      ]);

    const controller = await controllerWith(model);
    const draft = await controller.draft('Two K2 keyboards, please.');

    expect(draft).toEqual({ sku: 'KB-101', quantity: 2 });
    expect(model.calls).toHaveLength(2);
  });

  it('answers 422 when the model never matches the schema', async () => {
    const wrong = { name: ANSWER, args: { sku: 'KB-101', quantity: 'two' } };
    const model = fakeModel()
      .respondWithTools([wrong])
      .respondWithTools([wrong])
      .respondWithTools([wrong]);

    const controller = await controllerWith(model);

    await expect(controller.draft('Two K2 keyboards, please.')).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(model.calls).toHaveLength(3);
  });
});
