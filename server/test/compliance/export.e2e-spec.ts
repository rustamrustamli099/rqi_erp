import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

import { JwtAuthGuard } from '../../src/platform/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../src/platform/auth/permissions.guard';

describe('Compliance Export (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(PermissionsGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/compliance/export/soc2 (GET) - Should return JSON Evidence', async () => {
        const response = await request(app.getHttpServer())
            .get('/compliance/export/soc2')
            .expect(200);

        expect(response.body).toHaveProperty('evidence_id');
        expect(response.body).toHaveProperty('scope', 'SOC2_TYPE_II');
        expect(response.body).toHaveProperty('controls');
        expect(response.body.controls['CC6.2'].status).toBe('EFFECTIVE');
    });

    it('/compliance/export/iso27001 (GET) - Should return ISO SoA', async () => {
        const response = await request(app.getHttpServer())
            .get('/compliance/export/iso27001')
            .expect(200);

        expect(response.body).toHaveProperty('soa_id');
        expect(response.body).toHaveProperty('standard', 'ISO/IEC 27001:2022');
        expect(Array.isArray(response.body.controls)).toBeTruthy();
    });

    it('/compliance/export/invalid (GET) - Should return 404', async () => {
        await request(app.getHttpServer())
            .get('/compliance/export/invalid')
            .expect(404);
    });
});
