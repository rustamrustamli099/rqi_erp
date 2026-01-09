import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            return true; // Allow if no user (AuthGuard handles authentication)
        }

        // Fetch Access Policies
        const policy = await this.prisma.accessPolicy.findFirst({
            where: { userId: user.id },
        });

        if (!policy) {
            return true; // No restrictions
        }



        const now = new Date();
        const dayOfWeek = now.getDay(); // 0-6
        const currentHour = now.getHours();
        const clientIp = request.ip;

        // SQLite stores as "0,1,2" string
        const allowedDays = policy.allowedDays ? (policy.allowedDays as unknown as string).split(',').map(Number) : [];
        if (allowedDays.length > 0 && !allowedDays.includes(dayOfWeek)) {
            throw new ForbiddenException('Access denied on this day of the week.');
        }

        // 2. Check Hours
        if (policy.allowedStartHour !== null && currentHour < policy.allowedStartHour) {
            throw new ForbiddenException(`Access allowed only after ${policy.allowedStartHour}:00.`);
        }

        if (policy.allowedEndHour !== null && currentHour >= policy.allowedEndHour) {
            throw new ForbiddenException(`Access allowed only before ${policy.allowedEndHour}:00.`);
        }

        // 3. Check IP
        const allowedIps = policy.allowedIps ? (policy.allowedIps as unknown as string).split(',') : [];
        if (allowedIps.length > 0) {
            if (!allowedIps.includes(clientIp)) {
                throw new ForbiddenException('Access denied from this IP address.');
            }
        }

        return true;
    }
}
