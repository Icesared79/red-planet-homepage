// State FIPS prefix → 2-letter postal code. Covers all 50 states + DC + PR.
const STATE_FIPS: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY", "72": "PR",
};

// Curated 5-digit county FIPS → {county, state}. Covers the counties Atlas
// currently runs against plus the most populous US counties so prospect-facing
// rows resolve cleanly. Add new entries as new county runners come online.
const COUNTY_FIPS: Record<string, { county: string; state: string }> = {
  // Alabama
  "01073": { county: "Jefferson County", state: "AL" },
  // Arizona
  "04013": { county: "Maricopa County", state: "AZ" },
  "04019": { county: "Pima County", state: "AZ" },
  // California
  "06001": { county: "Alameda County", state: "CA" },
  "06013": { county: "Contra Costa County", state: "CA" },
  "06037": { county: "Los Angeles County", state: "CA" },
  "06059": { county: "Orange County", state: "CA" },
  "06065": { county: "Riverside County", state: "CA" },
  "06067": { county: "Sacramento County", state: "CA" },
  "06071": { county: "San Bernardino County", state: "CA" },
  "06073": { county: "San Diego County", state: "CA" },
  "06075": { county: "San Francisco County", state: "CA" },
  "06081": { county: "San Mateo County", state: "CA" },
  "06085": { county: "Santa Clara County", state: "CA" },
  "06097": { county: "Sonoma County", state: "CA" },
  // Colorado
  "08001": { county: "Adams County", state: "CO" },
  "08005": { county: "Arapahoe County", state: "CO" },
  "08031": { county: "Denver County", state: "CO" },
  "08035": { county: "Douglas County", state: "CO" },
  "08041": { county: "El Paso County", state: "CO" },
  "08059": { county: "Jefferson County", state: "CO" },
  // Connecticut
  "09001": { county: "Fairfield County", state: "CT" },
  "09003": { county: "Hartford County", state: "CT" },
  "09005": { county: "Litchfield County", state: "CT" },
  "09007": { county: "Middlesex County", state: "CT" },
  "09009": { county: "New Haven County", state: "CT" },
  "09011": { county: "New London County", state: "CT" },
  "09013": { county: "Tolland County", state: "CT" },
  "09015": { county: "Windham County", state: "CT" },
  // DC
  "11001": { county: "District of Columbia", state: "DC" },
  // Florida
  "12011": { county: "Broward County", state: "FL" },
  "12031": { county: "Duval County", state: "FL" },
  "12057": { county: "Hillsborough County", state: "FL" },
  "12086": { county: "Miami-Dade County", state: "FL" },
  "12095": { county: "Orange County", state: "FL" },
  "12099": { county: "Palm Beach County", state: "FL" },
  "12103": { county: "Pinellas County", state: "FL" },
  "12127": { county: "Volusia County", state: "FL" },
  // Georgia
  "13063": { county: "Clayton County", state: "GA" },
  "13067": { county: "Cobb County", state: "GA" },
  "13089": { county: "DeKalb County", state: "GA" },
  "13121": { county: "Fulton County", state: "GA" },
  "13135": { county: "Gwinnett County", state: "GA" },
  // Illinois
  "17031": { county: "Cook County", state: "IL" },
  "17043": { county: "DuPage County", state: "IL" },
  "17089": { county: "Kane County", state: "IL" },
  "17097": { county: "Lake County", state: "IL" },
  "17197": { county: "Will County", state: "IL" },
  // Indiana
  "18097": { county: "Marion County", state: "IN" },
  // Maryland
  "24003": { county: "Anne Arundel County", state: "MD" },
  "24005": { county: "Baltimore County", state: "MD" },
  "24031": { county: "Montgomery County", state: "MD" },
  "24033": { county: "Prince George's County", state: "MD" },
  "24510": { county: "Baltimore City", state: "MD" },
  // Massachusetts
  "25017": { county: "Middlesex County", state: "MA" },
  "25021": { county: "Norfolk County", state: "MA" },
  "25025": { county: "Suffolk County", state: "MA" },
  "25027": { county: "Worcester County", state: "MA" },
  // Michigan
  "26125": { county: "Oakland County", state: "MI" },
  "26163": { county: "Wayne County", state: "MI" },
  // Minnesota
  "27053": { county: "Hennepin County", state: "MN" },
  "27123": { county: "Ramsey County", state: "MN" },
  // Missouri
  "29095": { county: "Jackson County", state: "MO" },
  "29189": { county: "St. Louis County", state: "MO" },
  // Nevada
  "32003": { county: "Clark County", state: "NV" },
  "32031": { county: "Washoe County", state: "NV" },
  // New Jersey
  "34003": { county: "Bergen County", state: "NJ" },
  "34013": { county: "Essex County", state: "NJ" },
  "34017": { county: "Hudson County", state: "NJ" },
  "34023": { county: "Middlesex County", state: "NJ" },
  "34025": { county: "Monmouth County", state: "NJ" },
  // New York
  "36005": { county: "Bronx County", state: "NY" },
  "36029": { county: "Erie County", state: "NY" },
  "36047": { county: "Kings County", state: "NY" },
  "36055": { county: "Monroe County", state: "NY" },
  "36059": { county: "Nassau County", state: "NY" },
  "36061": { county: "New York County", state: "NY" },
  "36071": { county: "Orange County", state: "NY" },
  "36081": { county: "Queens County", state: "NY" },
  "36085": { county: "Richmond County", state: "NY" },
  "36103": { county: "Suffolk County", state: "NY" },
  "36119": { county: "Westchester County", state: "NY" },
  // North Carolina
  "37119": { county: "Mecklenburg County", state: "NC" },
  "37183": { county: "Wake County", state: "NC" },
  // Ohio
  "39035": { county: "Cuyahoga County", state: "OH" },
  "39049": { county: "Franklin County", state: "OH" },
  "39061": { county: "Hamilton County", state: "OH" },
  // Oregon
  "41051": { county: "Multnomah County", state: "OR" },
  "41067": { county: "Washington County", state: "OR" },
  // Pennsylvania
  "42003": { county: "Allegheny County", state: "PA" },
  "42017": { county: "Bucks County", state: "PA" },
  "42029": { county: "Chester County", state: "PA" },
  "42045": { county: "Delaware County", state: "PA" },
  "42091": { county: "Montgomery County", state: "PA" },
  "42101": { county: "Philadelphia County", state: "PA" },
  // Tennessee
  "47037": { county: "Davidson County", state: "TN" },
  "47157": { county: "Shelby County", state: "TN" },
  // Texas
  "48029": { county: "Bexar County", state: "TX" },
  "48085": { county: "Collin County", state: "TX" },
  "48113": { county: "Dallas County", state: "TX" },
  "48121": { county: "Denton County", state: "TX" },
  "48141": { county: "El Paso County", state: "TX" },
  "48157": { county: "Fort Bend County", state: "TX" },
  "48201": { county: "Harris County", state: "TX" },
  "48439": { county: "Tarrant County", state: "TX" },
  "48453": { county: "Travis County", state: "TX" },
  "48491": { county: "Williamson County", state: "TX" },
  // Utah
  "49035": { county: "Salt Lake County", state: "UT" },
  "49049": { county: "Utah County", state: "UT" },
  // Virginia
  "51059": { county: "Fairfax County", state: "VA" },
  "51153": { county: "Prince William County", state: "VA" },
  "51810": { county: "Virginia Beach", state: "VA" },
  // Washington
  "53033": { county: "King County", state: "WA" },
  "53053": { county: "Pierce County", state: "WA" },
  "53061": { county: "Snohomish County", state: "WA" },
  // Wisconsin
  "55079": { county: "Milwaukee County", state: "WI" },
};

export type FipsLookup = { county: string; state: string };

export function resolveCountyFips(fips: string): FipsLookup | null {
  const key = fips.padStart(5, "0");
  return COUNTY_FIPS[key] ?? null;
}

export function stateFromFips(fips: string): string | null {
  const padded = fips.padStart(5, "0");
  return STATE_FIPS[padded.slice(0, 2)] ?? null;
}

export function stateNameToCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim().toUpperCase();
  if (trimmed.length === 2 && Object.values(STATE_FIPS).includes(trimmed)) {
    return trimmed;
  }
  return null;
}

export const ALL_STATE_CODES = Object.values(STATE_FIPS);
