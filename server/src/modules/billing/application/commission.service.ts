
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service'; // Adjust if needed
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CommissionService {
    private readonly logger = new Logger(CommissionService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Calculates and distributes commission for a given payment.
     * @param invoiceId Linked invoice
     * @param amount Total payment amount
     * @param tenantId The customer tenant ID
     */
    async processCommission(invoiceId: string, amount: number, tenantId: string) {
        // 1. Check if Tenant has a Parent (Reseller)
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { parentTenant: { include: { resellerProfile: true } } }
        });

        if (!tenant || !tenant.parentTenant || !tenant.parentTenant.resellerProfile) {
            // Direct Customer (System gets 100%)
            this.logger.log(`Tenant ${tenantId} is direct customer. No commission split.`);
            return;
        }

        const reseller = tenant.parentTenant;
        const profile = reseller.resellerProfile!; // Assert non-null because we checked above

        // 2. Calculate Split
        const commissionRate = Number(profile.commissionRate) / 100;
        const commissionAmount = amount * commissionRate;
        const systemAmount = amount - commissionAmount;

        this.logger.log(`Processing Commission for Reseller ${reseller.id}: Rate ${profile.commissionRate}%, Earned: ${commissionAmount}`);

        // 3. Update Reseller Stats
        await this.prisma.resellerProfile.update({
            where: { id: profile.id },
            data: {
                totalRevenue: { increment: amount },
                totalCommission: { increment: commissionAmount }
            }
        });

        // 4. Create Ledger Entries for Commission (Payable)
        // Debit: Commission Expense (System) or Reduction in Revenue? 
        // For simplicity: We recorded full Revenue in BillingEngine. 
        // Now we Debit Revenue (offset) and Credit Payable (Reseller).

        // OR: We create a specific "Commission Payable" entry.

        await this.prisma.ledgerEntry.create({
            data: {
                tenantId: reseller.id, // Reseller sees this as Income? Or System sees it as Payable?
                // Let's model it as Reseller's "Commission Revenue"
                debitAccount: 'CASH', // Actually standard AC is: System owes Reseller. 
                // But simplified: Reseller Ledger says "Revenue".
                creditAccount: 'REVENUE', // Reseller Revenue
                amount: new Decimal(commissionAmount),
                currency: 'AZN',
            }
        });

        // Optional: System side Logger for "Commission Expense"
    }
}
