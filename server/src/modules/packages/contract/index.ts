
export interface PackageDTO {
    id: string;
    name: string;
    priceMonthly: number; // or Decimal / string
    currency: string;
    // other fields
}

export interface IPackagesService {
    findOne(id: string): Promise<PackageDTO | null>;
}
