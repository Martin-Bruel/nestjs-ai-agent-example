import { Test, TestingModule } from '@nestjs/testing';
import { AIMessage } from '@langchain/core/messages';
import { fakeModel } from '@langchain/core/testing';
import { Agent, LangChainModule } from 'nestjs-langchain';
import { CatalogModule } from './catalog.module.js';

describe('the catalog tools', () => {
  let moduleRef: TestingModule;

  // An agent with the real tools of CatalogModule, and a model that replays
  // the tool calls it is given: no API key, no network.
  const agentWith = async (model: ReturnType<typeof fakeModel>) => {
    moduleRef = await Test.createTestingModule({
      imports: [
        CatalogModule,
        LangChainModule.register({ model, tools: [CatalogModule] }),
      ],
    }).compile();
    // The agent is built on init, which `compile()` does not run.
    await moduleRef.init();
    return moduleRef.get(Agent);
  };

  // What the model received from the tools before its last answer.
  const toolResults = (model: ReturnType<typeof fakeModel>) =>
    model.calls
      .at(-1)
      ?.messages.filter((message) => message.type === 'tool')
      .map((message) => message.text);

  afterEach(async () => {
    await moduleRef.close();
  });

  it('searches the catalog, then checks the stock', async () => {
    const model = fakeModel()
      .respondWithTools([
        { name: 'searchProducts', args: { query: 'keyboard', maxPrice: 100 } },
      ])
      .respondWithTools([{ name: 'checkStock', args: { sku: 'KB-101' } }])
      .respond(new AIMessage('The K2 mechanical keyboard: 89 €, 12 in stock.'));

    const agent = await agentWith(model);
    const { output, tools } = await agent.run(
      'A keyboard under 100 euros, in stock?',
    );

    expect(tools).toEqual(['searchProducts', 'checkStock']);
    expect(output).toBe('The K2 mechanical keyboard: 89 €, 12 in stock.');
    const [found, stock] = toolResults(model) ?? [];
    expect(
      JSON.parse(found).map((product: { sku: string }) => product.sku),
    ).toEqual(['KB-205', 'KB-101']);
    expect(stock).toBe('12');
  });

  it('tells the model when a product does not exist', async () => {
    const model = fakeModel()
      .respondWithTools([{ name: 'checkStock', args: { sku: 'XX-000' } }])
      .respond(new AIMessage('That product does not exist.'));

    const agent = await agentWith(model);
    const { tools } = await agent.run('Is XX-000 in stock?');

    expect(tools).toEqual(['checkStock']);
    expect(toolResults(model)).toEqual([
      'Error: No product with SKU XX-000.\n Please fix your mistakes.',
    ]);
  });

  it('tells the model when a category is outside the schema', async () => {
    const model = fakeModel()
      .respondWithTools([
        {
          name: 'searchProducts',
          args: { query: 'laptop', category: 'laptop' },
        },
      ])
      .respond(new AIMessage('We sell no laptops.'));

    const agent = await agentWith(model);
    await agent.run('A laptop?');

    expect(toolResults(model)?.[0]).toContain(
      'expected one of "keyboard"|"mouse"|"headset"',
    );
  });
});
