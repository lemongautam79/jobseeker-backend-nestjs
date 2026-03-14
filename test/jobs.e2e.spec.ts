import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Jobs E2E', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    // it('POST /jobs should fail without auth', async () => {
    //     await request(app.getHttpServer())
    //         .post('/v1/jobs')
    //         .send({ title: 'Dev' })
    //         .expect(401);
    // });

    afterAll(async () => {
        await app.close();
    });
});