export interface PackageDTO {
    id: string;
    name: string;
    priceMonthly: number;
    currency: string;
}
export interface IPackagesService {
    findOne(id: string): Promise<PackageDTO | null>;
}
