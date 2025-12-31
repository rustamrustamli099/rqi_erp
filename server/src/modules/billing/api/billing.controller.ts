import { Controller, Get, Post, Body, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { BillingUseCase } from '../application/billing.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';
import { TenantContextGuard } from '../../../platform/tenant-context/tenant-context.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class BillingController {
    constructor(private readonly billingUseCase: BillingUseCase) { }

    @Get('subscription')
    async getMySubscription(@Req() req: any) {
        const sub = await this.billingUseCase.getSubscription(req.user.tenantId);
        if (!sub) throw new NotFoundException('No active subscription found for this tenant');
        // Calculate current total on the fly for display
        const total = await this.billingUseCase.calculateMonthlyTotal(sub.id);
        return {
            ...sub,
            currentMonthlyTotal: total
        };
    }

    @Post('items')
    async addSubscriptionItem(@Req() req: any, @Body() body: any) {
        // Enforce that we are adding to OUR subscription
        const sub = await this.billingUseCase.getSubscription(req.user.tenantId);
        if (!sub) throw new NotFoundException('No active subscription found');

        await this.billingUseCase.addSubscriptionItem(
            sub.id,
            body.name,
            body.type,
            body.price,
            body.quantity
        );
        return { success: true, message: 'Item added and prorated invoice generated if applicable.' };
    }
}
