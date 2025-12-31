import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubscriptionsUseCase } from '../application/subscriptions.usecase';
import { Permissions } from '../../../platform/auth/permissions.decorator';
import { PermissionsGuard } from '../../../platform/auth/permissions.guard';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsUseCase: SubscriptionsUseCase) { }

  @Post()
  @Permissions('system:subscriptions:manage')
  create(@Body() createSubscriptionDto: any) {
    return this.subscriptionsUseCase.create(createSubscriptionDto);
  }

  @Get()
  @Permissions('system:subscriptions:read')
  findAll() {
    return this.subscriptionsUseCase.findAll();
  }

  @Get(':id')
  @Permissions('system:subscriptions:read')
  findOne(@Param('id') id: string) {
    return this.subscriptionsUseCase.findOne(id);
  }

  @Delete(':id')
  @Permissions('system:subscriptions:manage')
  remove(@Param('id') id: string) {
    return this.subscriptionsUseCase.remove(id);
  }
}
