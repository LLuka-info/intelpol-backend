// utils/cnpUtils.ts
export function getBirthdateFromCNP(cnp: string): Date | null {
  if (!cnp || cnp.length !== 13) return null;

  const gender = parseInt(cnp[0], 10);
  const year = parseInt(cnp.slice(1, 3), 10);
  const month = parseInt(cnp.slice(3, 5), 10) - 1; // zero-based
  const day = parseInt(cnp.slice(5, 7), 10);

  let fullYear = 1900 + year;
  if (gender >= 5) fullYear = 2000 + year;

  return new Date(fullYear, month, day);
}

export function getAgeFromBirthdate(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function extractCityCountyStreet(address: string): {
  judet: string;
  oras: string;
  strada: string;
} {
  let judet = "—", oras = "—", strada = address;
  const judMatch = address.match(/Jud\.\s*([A-Z]{1,3})/i);
  const orasMatch = address.match(/\b(Mun\.|Orașul|Orasul|Oraș|Municipiul)\s+([^,]+)/i);

  const stradaMatch = address.match(/Str\.\s*([^,]+)/i);

  if (judMatch) judet = judMatch[1].trim();
  if (orasMatch) oras = orasMatch[2].trim();
  if (stradaMatch) strada = "Str. " + stradaMatch[1].trim();

  return { judet, oras, strada };
}
