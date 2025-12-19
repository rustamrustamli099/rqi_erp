import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AddressesUseCase } from '../application/addresses.usecase';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard'; // Adjust path if needed

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesUseCase: AddressesUseCase) { }

    @Get()
    findAll() {
        return this.addressesUseCase.findAllCountries();
    }

    // --- Country ---
    @Post('countries')
    createCountry(@Body() data: Prisma.CountryCreateInput) {
        return this.addressesUseCase.createCountry(data);
    }

    @Put('countries/:id')
    updateCountry(@Param('id') id: string, @Body() data: Prisma.CountryUpdateInput) {
        return this.addressesUseCase.updateCountry(id, data);
    }

    @Delete('countries/:id')
    deleteCountry(@Param('id') id: string) {
        return this.addressesUseCase.deleteCountry(id);
    }

    // --- City ---
    @Post('cities')
    createCity(@Body() data: Prisma.CityCreateInput) {
        return this.addressesUseCase.createCity(data);
    }

    @Put('cities/:id')
    updateCity(@Param('id') id: string, @Body() data: Prisma.CityUpdateInput) {
        return this.addressesUseCase.updateCity(id, data);
    }

    @Delete('cities/:id')
    deleteCity(@Param('id') id: string) {
        return this.addressesUseCase.deleteCity(id);
    }

    // --- District ---
    @Post('districts')
    createDistrict(@Body() data: Prisma.DistrictCreateInput) {
        return this.addressesUseCase.createDistrict(data);
    }

    @Put('districts/:id')
    updateDistrict(@Param('id') id: string, @Body() data: Prisma.DistrictUpdateInput) {
        return this.addressesUseCase.updateDistrict(id, data);
    }

    @Delete('districts/:id')
    deleteDistrict(@Param('id') id: string) {
        return this.addressesUseCase.deleteDistrict(id);
    }
}
