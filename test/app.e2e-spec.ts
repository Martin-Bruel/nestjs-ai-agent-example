import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Agent } from 'nestjs-langchain';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Replaces the agent, and with it the OpenAI model: no API key needed.
      .overrideProvider(Agent)
      .useValue({
        run: async () => ({
          status: 'completed',
          output: 'An answer.',
          tools: [],
          durationMs: 0,
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ask (POST)', () => {
    return request(app.getHttpServer())
      .post('/ask')
      .send({ question: 'Is the K2 keyboard in stock?' })
      .expect(201)
      .expect({ output: 'An answer.', tools: [] });
  });

  afterEach(async () => {
    await app.close();
  });
});
