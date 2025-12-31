
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantContext = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        // Return the whole context object or just tenantId based on need
        // For FinanceController we used @TenantContext() context: any
        // And accessed context.tenantId
        return {
            tenantId: request.tenantId || request.user?.tenantId,
            user: request.user
        };
    },
);
