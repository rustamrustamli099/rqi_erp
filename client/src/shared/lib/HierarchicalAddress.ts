export interface IAddress {
    country: string;
    city: string;
    district?: string;
    street?: string;
    zipCode?: string;
}

export class HierarchicalAddress {
    private address: IAddress;

    constructor(address: IAddress) {
        this.address = address;
    }

    public static fromString(country: string, city: string, district?: string, street?: string, zip?: string): HierarchicalAddress {
        return new HierarchicalAddress({
            country,
            city,
            district,
            street,
            zipCode: zip
        });
    }

    public isValid(): boolean {
        // Basic validation: Country and City are mandatory
        return !!this.address.country && !!this.address.city;
    }

    public toString(): string {
        const parts = [
            this.address.street,
            this.address.district,
            this.address.city,
            this.address.zipCode ? `AZ${this.address.zipCode}` : null,
            this.address.country
        ].filter(Boolean);

        return parts.join(", ");
    }

    public getRegionKey(): string {
        return `${this.address.country}_${this.address.city}`.toLowerCase();
    }
}
