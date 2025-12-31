import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class SubscriptionsUseCase {
  constructor(private readonly prisma: PrismaService) { }

  async create(createSubscriptionDto: any) {
    // Check if tenant already has an active subscription
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId: createSubscriptionDto.tenantId }
    });

    if (existing && existing.status === 'ACTIVE') {
      throw new BadRequestException('Tenant already has an active subscription');
    }

    const pkg = await this.prisma.package.findUnique({ where: { id: createSubscriptionDto.packageId } });
    if (!pkg) throw new BadRequestException('Package not found');

    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1); // Simple monthly logic

    // Upsert to handle re-subscription
    return this.prisma.subscription.upsert({
      where: { tenantId: createSubscriptionDto.tenantId },
      update: {
        packageId: createSubscriptionDto.packageId,
        status: 'ACTIVE',
        startDate: new Date(),
        nextBillingDate: nextBilling,
        endDate: null
      },
      create: {
        tenantId: createSubscriptionDto.tenantId,
        packageId: createSubscriptionDto.packageId,
        status: 'ACTIVE',
        startDate: new Date(),
        nextBillingDate: nextBilling,
        billingCycle: 'MONTHLY'
      }
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        tenant: { select: { name: true, slug: true } },
        package: { select: { name: true, priceMonthly: true, currency: true } }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        tenant: true,
        package: true,
        invoices: true
      }
    });
  }

  // Cancel subscription
  async remove(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELED', endDate: new Date() }
    });
  }
}
