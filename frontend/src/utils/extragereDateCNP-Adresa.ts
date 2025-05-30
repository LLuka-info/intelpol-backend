function extrageDataNastereDinCNP(cnp: string): Date | null {
  if (!cnp || cnp.length !== 13) return null;

  const prefix = parseInt(cnp[0], 10);
  const an = parseInt(cnp.slice(1, 3), 10);
  const luna = parseInt(cnp.slice(3, 5), 10) - 1; 
  const zi = parseInt(cnp.slice(5, 7), 10);

  let anComplet: number;

  switch (prefix) {
    case 1:
    case 2:
      anComplet = 1900 + an;
      break;
    case 3:
    case 4:
      anComplet = 1800 + an;
      break;
    case 5:
    case 6:
      anComplet = 2000 + an;
      break;
    default:
      return null; 
  }

  const dataNastere = new Date(anComplet, luna, zi);
  return isNaN(dataNastere.getTime()) ? null : dataNastere;
}

function calcVarsta(dataNastere: Date | null): number | null {
  if (!dataNastere) return null;

  const azi = new Date();
  let varsta = azi.getFullYear() - dataNastere.getFullYear();

  const ziuaDeNastereTrecuta =
    azi.getMonth() > dataNastere.getMonth() ||
    (azi.getMonth() === dataNastere.getMonth() && azi.getDate() >= dataNastere.getDate());

  if (!ziuaDeNastereTrecuta) {
    varsta--;
  }

  return varsta;
}


function extrageJudetOrasStrada(adresa: string): {
  judet: string;
  oras: string;
  strada: string;
} {
  let judet = "—";
  let oras = "—";
  let strada = adresa;

  const regexJudet = /Jud\.?\s*([A-ZĂÂÎȘȚ]{1,3})/i;
  const regexOras = /\b(?:Mun\.|Municipiul|Orașul|Orasul|Oraș|Oras|Satul|Comuna)\s+([^,]+)/i;
  const regexStrada = /Str\.?\s*([^,]+)/i;

  const matchJudet = adresa.match(regexJudet);
  const matchOras = adresa.match(regexOras);
  const matchStrada = adresa.match(regexStrada);

  if (matchJudet) judet = matchJudet[1].trim();
  if (matchOras) oras = matchOras[1].trim();
  if (matchStrada) strada = `Str. ${matchStrada[1].trim()}`;

  return { judet, oras, strada };
}

export {
  extrageDataNastereDinCNP,
  calcVarsta,
  extrageJudetOrasStrada
};