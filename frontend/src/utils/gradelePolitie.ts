const getEpoleti = (rank: string) => {
  const normalizedRank = rank.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  //Agenti - bare
  if (normalizedRank == "agent") return { symbol: "Ag", className: "gradAgent" };
  if (normalizedRank == "agent principal") return { symbol: "AP", className: "gradAgentPrincipal" };
  if (normalizedRank=="agent sef adjunct") return { symbol: "ASA", className: "gradAgentSefAdjunct" };
  if (normalizedRank=="agent sef") return { symbol: "AS", className: "gradAgentSef" };
  if (normalizedRank=="agent sef principal") return { symbol: "ASP", className: "gradAgentSefPrincipal" };
  
  //Inspectori - stelute negre
  if (normalizedRank=="subinspector") return { symbol: "SI", className: "gradSubinspector" };
  if (normalizedRank=="inspector") return { symbol: "I", className: "gradInspector" };
  if (normalizedRank=="inspector principal") return { symbol: "IP", className: "gradInspectorPrincipal" };
  
  //Comisari - stelute albastre
  if (normalizedRank=="subcomisar") return { symbol: "SC", className: "gradSubcomisar" };
  if (normalizedRank=="comisar") return { symbol: "C", className: "gradComisar" };
  if (normalizedRank=="comisarsef") return { symbol: "CȘ", className: "gradComisarSef" };
  
  //Chestori - stelute rosii
  if (normalizedRank=="chestor") return { symbol: "Ch", className: "gradChestor" };
  if (normalizedRank=="chestorprincipal") return { symbol: "ChP", className: "gradChestorPrincipal" };
  if (normalizedRank=="chestorsefadjunct") return { symbol: "ChSA", className: "gradChestorSefAdjunct" };
  if (normalizedRank=="chestorsef")return { symbol: "ChS", className: "gradChestorSef" };
  if (normalizedRank=="chestorgeneral")return { symbol: "ChG", className: "gradChestorGeneral" };

  return { symbol: "?", className: "gradDefault" };
};

export default getEpoleti

