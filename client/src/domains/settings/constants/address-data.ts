import type { Country } from "@/types/schema";

export const ADDRESS_DATA: Country[] = [
    {
        id: "az",
        name: "Azərbaycan",
        code: "AZ",
        phoneCode: "+994",
        cities: [
            {
                id: "baku",
                name: "Bakı",
                countryId: "az",
                districts: [
                    { id: "binagadi", name: "Binəqədi", cityId: "baku", streets: [] },
                    { id: "nizami", name: "Nizami", cityId: "baku", streets: [] },
                    { id: "narimanov", name: "Nərimanov", cityId: "baku", streets: [{ id: "n_narimanov_st1", name: "Ağa Nemətulla", districtId: "narimanov" }] },
                    { id: "nasimi", name: "Nəsimi", cityId: "baku", streets: [] },
                    { id: "sabail", name: "Səbail", cityId: "baku", streets: [] },
                    { id: "sabunchu", name: "Sabunçu", cityId: "baku", streets: [] },
                    { id: "surakhani", name: "Suraxanı", cityId: "baku", streets: [] },
                    { id: "khatai", name: "Xətai", cityId: "baku", streets: [] },
                    { id: "khazar", name: "Xəzər", cityId: "baku", streets: [] },
                    { id: "yasamal", name: "Yasamal", cityId: "baku", streets: [] },
                    { id: "garadagh", name: "Qaradağ", cityId: "baku", streets: [] },
                    { id: "pirallahi", name: "Pirallahı", cityId: "baku", streets: [] },
                ]
            },
            {
                id: "sumqayit",
                name: "Sumqayıt",
                countryId: "az",
                districts: [
                    { id: "hacizey", name: "H.Z. Tağıyev qəs.", cityId: "sumqayit", streets: [] },
                    { id: "corat", name: "Corat", cityId: "sumqayit", streets: [] },
                ]
            },
            {
                id: "ganja",
                name: "Gəncə",
                countryId: "az",
                districts: [
                    { id: "kapaz", name: "Kəpəz", cityId: "ganja", streets: [] },
                    { id: "nizami_gnj", name: "Nizami (Gəncə)", cityId: "ganja", streets: [] },
                ]
            },
            {
                id: "nakhchivan",
                name: "Naxçıvan",
                countryId: "az",
                districts: []
            },
            // Rayons functioning as cities for address purposes
            { id: "shaki", name: "Şəki", countryId: "az", districts: [] },
            { id: "lankaran", name: "Lənkəran", countryId: "az", districts: [] },
            { id: "quba", name: "Quba", countryId: "az", districts: [] },
            { id: "qusark", name: "Qusar", countryId: "az", districts: [] },
            { id: "gabala", name: "Qəbələ", countryId: "az", districts: [] },
        ]
    },
    {
        id: "tr",
        name: "Türkiyə",
        code: "TR",
        phoneCode: "+90",
        cities: [
            {
                id: "istanbul",
                name: "İstanbul",
                countryId: "tr",
                districts: [
                    { id: "kadikoy", name: "Kadıköy", cityId: "istanbul", streets: [] },
                    { id: "besiktas", name: "Beşiktaş", cityId: "istanbul", streets: [] },
                    { id: "sisli", name: "Şişli", cityId: "istanbul", streets: [] },
                ]
            },
            {
                id: "ankara",
                name: "Ankara",
                countryId: "tr",
                districts: [
                    { id: "cankaya", name: "Çankaya", cityId: "ankara", streets: [] },
                    { id: "kecioren", name: "Keçiören", cityId: "ankara", streets: [] },
                ]
            }
        ]
    }
];
