import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path if needed

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Get()
    findAll() {
        return this.addressesService.findAllCountries();
    }

    // --- Country ---
    @Post('countries')
    createCountry(@Body() data: Prisma.CountryCreateInput) {
        return this.addressesService.createCountry(data);
    }

    @Put('countries/:id')
    updateCountry(@Param('id') id: string, @Body() data: Prisma.CountryUpdateInput) {
        return this.addressesService.updateCountry(id, data);
    }

    @Delete('countries/:id')
    deleteCountry(@Param('id') id: string) {
        return this.addressesService.deleteCountry(id);
    }

    // --- City ---
    @Post('cities')
    createCity(@Body() data: Prisma.CityCreateInput) {
        return this.addressesService.createCity(data);
    }

    @Put('cities/:id')
    updateCity(@Param('id') id: string, @Body() data: Prisma.CityUpdateInput) {
        return this.addressesService.updateCity(id, data);
    }

    @Delete('cities/:id')
    deleteCity(@Param('id') id: string) {
        return this.addressesService.deleteCity(id);
    }

    // --- District ---
    @Post('districts')
    createDistrict(@Body() data: Prisma.DistrictCreateInput) {
        return this.addressesService.createDistrict(data);
    }

    @Put('districts/:id')
    updateDistrict(@Param('id') id: string, @Body() data: Prisma.DistrictUpdateInput) {
        return this.addressesService.updateDistrict(id, data);
    }

    @Delete('districts/:id')
    deleteDistrict(@Param('id') id: string) {
        return this.addressesService.deleteDistrict(id);
    }
}
