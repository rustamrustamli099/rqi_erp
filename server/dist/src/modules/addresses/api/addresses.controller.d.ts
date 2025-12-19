import { AddressesUseCase } from '../application/addresses.usecase';
import { Prisma } from '@prisma/client';
export declare class AddressesController {
    private readonly addressesUseCase;
    constructor(addressesUseCase: AddressesUseCase);
    findAll(): Promise<({
        cities: ({
            districts: {
                id: string;
                name: string;
                cityId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            name: string;
            countryId: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        code: string;
        phoneCode: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createCountry(data: Prisma.CountryCreateInput): Promise<{
        id: string;
        name: string;
        code: string;
        phoneCode: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCountry(id: string, data: Prisma.CountryUpdateInput): Promise<{
        id: string;
        name: string;
        code: string;
        phoneCode: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCountry(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        phoneCode: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createCity(data: Prisma.CityCreateInput): Promise<{
        id: string;
        name: string;
        countryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCity(id: string, data: Prisma.CityUpdateInput): Promise<{
        id: string;
        name: string;
        countryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCity(id: string): Promise<{
        id: string;
        name: string;
        countryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDistrict(data: Prisma.DistrictCreateInput): Promise<{
        id: string;
        name: string;
        cityId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateDistrict(id: string, data: Prisma.DistrictUpdateInput): Promise<{
        id: string;
        name: string;
        cityId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteDistrict(id: string): Promise<{
        id: string;
        name: string;
        cityId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
