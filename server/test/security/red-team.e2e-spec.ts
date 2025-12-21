import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('Red-Team Security Simulation (E2E)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        try {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();

            app = moduleFixture.createNestApplication();
            await app.init();
        } catch (e) {
            console.error("App Init Failed:", e);
            throw e;
        }
    });

    afterAll(async () => {
        if (app) await app.close();
    });

    it('should initialize app successfully', () => {
        expect(app).toBeDefined();
    });
});
