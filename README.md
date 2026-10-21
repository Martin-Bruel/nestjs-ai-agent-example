# nestjs-ai-agent-example

A NestJS app with an AI agent, built with
[nestjs-langchain](https://github.com/Martin-Bruel/nestjs-langchain): the code of the series
_AI agents with NestJS_. Each article has a tag holding the code as the article leaves it.

| Tag                                                                             | Article                                            |
| ------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`part-1`](https://github.com/Martin-Bruel/nestjs-ai-agent-example/tree/part-1) | NestJS + LangChain: Build an AI Agent in 5 Minutes |
| [`part-2`](https://github.com/Martin-Bruel/nestjs-ai-agent-example/tree/part-2) | NestJS Tool Calling: Turn Services into LLM Tools  |

## Run it

Requires Node 22.12+ and an OpenAI API key.

```bash
git clone https://github.com/Martin-Bruel/nestjs-ai-agent-example.git
cd nestjs-ai-agent-example
npm install
export OPENAI_API_KEY=sk-...
npm run start:dev
```

Then ask the agent:

```bash
curl -X POST http://localhost:3000/ask \
  -H 'Content-Type: application/json' \
  -d '{"question": "Is there a keyboard under 100 euros in stock?"}'
```

The agent answers from a small catalog, in `src/catalog/products.repository.ts`, through the two
tools of `src/catalog/catalog.service.ts`. The response lists the tools it called.

Another provider: install its package and change `model` in `src/app.module.ts`, for instance
`anthropic:claude-sonnet-5-5` with `@langchain/anthropic`.

## Test it

The tests replace the model with LangChain's `fakeModel()`: no API key, no network.

```bash
npm test
npm run test:e2e
```

## License

MIT
