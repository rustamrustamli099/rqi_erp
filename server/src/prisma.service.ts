import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            datasources: {
                db: {
                    url: 'file:./dev.db',
                },
            },
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('Prisma connected successfully');
        } catch (error) {
            console.error('Prisma connection error:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
