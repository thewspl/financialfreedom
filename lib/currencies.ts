import { Value } from "@radix-ui/react-select";

export const Currencies = [
    {value: "TRY", label: "₺ Türk Lirası", locale:"tr-TR"},
    {value: "USD", label: "$ Dolar", locale:"en-US"},
    {value: "EUR", label: "€ Euro", locale:"de-DE"},
    {value: "GBP", label: "£ Sterlin", locale:"en-GB"},
]

export type Currency = (typeof Currencies)[0]