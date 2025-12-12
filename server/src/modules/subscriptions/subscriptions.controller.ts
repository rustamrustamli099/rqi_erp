import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  @Permissions('system:subscriptions:manage')
  create(@Body() createSubscriptionDto: any) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @Permissions('system:subscriptions:read')
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @Permissions('system:subscriptions:read')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Delete(':id')
  @Permissions('system:subscriptions:manage')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
