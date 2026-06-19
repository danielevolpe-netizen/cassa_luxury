// Utility per importi monetari e IVA.

/** Arrotonda a 2 decimali in modo stabile. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Converte un valore (numero o stringa numerica dal DB) in number. */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Converte un number in stringa decimale a 2 cifre per le colonne numeric. */
export function toDecimalString(n: number): string {
  return round2(n).toFixed(2);
}

/** Calcola IVA e totale da imponibile e aliquota (%). */
export function computeVat(
  taxable: number,
  ratePercent: number,
): { vat: number; total: number } {
  const vat = round2((taxable * ratePercent) / 100);
  const total = round2(taxable + vat);
  return { vat, total };
}

const eurFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  // In Italia in ambito contabile le migliaia si separano sempre (4.714,08),
  // mentre il locale CLDR di default raggrupperebbe solo da 5 cifre in su.
  useGrouping: "always",
});

/** Formatta un importo in euro (it-IT). */
export function formatEUR(value: number | string | null | undefined): string {
  return eurFormatter.format(toNumber(value));
}

