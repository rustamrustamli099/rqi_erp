import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { PaymentUseCase } from '../application/payment.usecase';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentUseCase: PaymentUseCase) { }

    @Post('webhook')
    async handleWebhook(@Headers('stripe-signature') signature: string, @Body() body: any) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }
        // Delegate to UseCase
        return this.paymentUseCase.handleWebhook('stripe', body);
    }
}
