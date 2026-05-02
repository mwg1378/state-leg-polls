/**
 * Curated list of Wikipedia mayoral election pages with known polling tables.
 *
 * The sweet spot for race-by-race polling coverage on Wikipedia is the largest cities;
 * smaller cities (under ~500K) often only have an election article without a "Polling"
 * section. This list intentionally over-covers — fetcher gracefully skips 404s.
 */

export const CURATED_URLS: Array<{ url: string; note?: string }> = [
  // === New York City ===
  { url: 'https://en.wikipedia.org/wiki/2013_New_York_City_mayoral_election', note: 'NYC 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_New_York_City_mayoral_election', note: 'NYC 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_New_York_City_mayoral_election', note: 'NYC 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_New_York_City_mayoral_election', note: 'NYC 2025' },
  { url: 'https://en.wikipedia.org/wiki/2021_New_York_City_Democratic_mayoral_primary', note: 'NYC 2021 D primary' },
  { url: 'https://en.wikipedia.org/wiki/2025_New_York_City_Democratic_mayoral_primary', note: 'NYC 2025 D primary' },

  // === Los Angeles ===
  { url: 'https://en.wikipedia.org/wiki/2013_Los_Angeles_mayoral_election', note: 'LA 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Los_Angeles_mayoral_election', note: 'LA 2017' },
  { url: 'https://en.wikipedia.org/wiki/2022_Los_Angeles_mayoral_election', note: 'LA 2022' },

  // === Chicago ===
  { url: 'https://en.wikipedia.org/wiki/2015_Chicago_mayoral_election', note: 'Chicago 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Chicago_mayoral_election', note: 'Chicago 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Chicago_mayoral_election', note: 'Chicago 2023' },

  // === Houston ===
  { url: 'https://en.wikipedia.org/wiki/2015_Houston_mayoral_election', note: 'Houston 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Houston_mayoral_election', note: 'Houston 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Houston_mayoral_election', note: 'Houston 2023' },

  // === Philadelphia ===
  { url: 'https://en.wikipedia.org/wiki/2015_Philadelphia_mayoral_election', note: 'Philly 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Philadelphia_mayoral_election', note: 'Philly 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Philadelphia_mayoral_election', note: 'Philly 2023' },

  // === San Francisco ===
  { url: 'https://en.wikipedia.org/wiki/2015_San_Francisco_mayoral_election', note: 'SF 2015' },
  { url: 'https://en.wikipedia.org/wiki/2018_San_Francisco_mayoral_special_election', note: 'SF 2018 special' },
  { url: 'https://en.wikipedia.org/wiki/2019_San_Francisco_mayoral_election', note: 'SF 2019' },
  { url: 'https://en.wikipedia.org/wiki/2024_San_Francisco_mayoral_election', note: 'SF 2024' },

  // === Seattle ===
  { url: 'https://en.wikipedia.org/wiki/2013_Seattle_mayoral_election', note: 'Seattle 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Seattle_mayoral_election', note: 'Seattle 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Seattle_mayoral_election', note: 'Seattle 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Seattle_mayoral_election', note: 'Seattle 2025' },

  // === Boston ===
  { url: 'https://en.wikipedia.org/wiki/2013_Boston_mayoral_election', note: 'Boston 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Boston_mayoral_election', note: 'Boston 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Boston_mayoral_election', note: 'Boston 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Boston_mayoral_election', note: 'Boston 2025' },

  // === Atlanta ===
  { url: 'https://en.wikipedia.org/wiki/2013_Atlanta_mayoral_election', note: 'Atlanta 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Atlanta_mayoral_election', note: 'Atlanta 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Atlanta_mayoral_election', note: 'Atlanta 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Atlanta_mayoral_election', note: 'Atlanta 2025' },

  // === Detroit ===
  { url: 'https://en.wikipedia.org/wiki/2013_Detroit_mayoral_election', note: 'Detroit 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Detroit_mayoral_election', note: 'Detroit 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Detroit_mayoral_election', note: 'Detroit 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Detroit_mayoral_election', note: 'Detroit 2025' },

  // === Miami ===
  { url: 'https://en.wikipedia.org/wiki/2013_Miami_mayoral_election', note: 'Miami 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Miami_mayoral_election', note: 'Miami 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Miami_mayoral_election', note: 'Miami 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Miami_mayoral_election', note: 'Miami 2025' },

  // === Minneapolis ===
  { url: 'https://en.wikipedia.org/wiki/2013_Minneapolis_mayoral_election', note: 'Minneapolis 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Minneapolis_mayoral_election', note: 'Minneapolis 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Minneapolis_mayoral_election', note: 'Minneapolis 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Minneapolis_mayoral_election', note: 'Minneapolis 2025' },

  // === Denver ===
  { url: 'https://en.wikipedia.org/wiki/2015_Denver_mayoral_election', note: 'Denver 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Denver_mayoral_election', note: 'Denver 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Denver_mayoral_election', note: 'Denver 2023' },

  // === Portland ===
  { url: 'https://en.wikipedia.org/wiki/2016_Portland,_Oregon_mayoral_election', note: 'Portland 2016' },
  { url: 'https://en.wikipedia.org/wiki/2020_Portland,_Oregon_mayoral_election', note: 'Portland 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_Portland,_Oregon_mayoral_election', note: 'Portland 2024' },

  // === Pittsburgh ===
  { url: 'https://en.wikipedia.org/wiki/2017_Pittsburgh_mayoral_election', note: 'Pittsburgh 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Pittsburgh_mayoral_election', note: 'Pittsburgh 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Pittsburgh_mayoral_election', note: 'Pittsburgh 2025' },

  // === St. Louis ===
  { url: 'https://en.wikipedia.org/wiki/2013_St._Louis_mayoral_election', note: 'StL 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_St._Louis_mayoral_election', note: 'StL 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_St._Louis_mayoral_election', note: 'StL 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_St._Louis_mayoral_election', note: 'StL 2025' },

  // === Cleveland ===
  { url: 'https://en.wikipedia.org/wiki/2013_Cleveland_mayoral_election', note: 'Cleveland 2013' },
  { url: 'https://en.wikipedia.org/wiki/2017_Cleveland_mayoral_election', note: 'Cleveland 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Cleveland_mayoral_election', note: 'Cleveland 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Cleveland_mayoral_election', note: 'Cleveland 2025' },

  // === Baltimore ===
  { url: 'https://en.wikipedia.org/wiki/2016_Baltimore_mayoral_election', note: 'Baltimore 2016' },
  { url: 'https://en.wikipedia.org/wiki/2020_Baltimore_mayoral_election', note: 'Baltimore 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_Baltimore_mayoral_election', note: 'Baltimore 2024' },

  // === Washington DC ===
  { url: 'https://en.wikipedia.org/wiki/2014_Washington,_D.C._mayoral_election', note: 'DC 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_Washington,_D.C._mayoral_election', note: 'DC 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Washington,_D.C._mayoral_election', note: 'DC 2022' },

  // === New Orleans ===
  { url: 'https://en.wikipedia.org/wiki/2014_New_Orleans_mayoral_election', note: 'NOLA 2014' },
  { url: 'https://en.wikipedia.org/wiki/2017_New_Orleans_mayoral_election', note: 'NOLA 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_New_Orleans_mayoral_election', note: 'NOLA 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_New_Orleans_mayoral_election', note: 'NOLA 2025' },

  // === Nashville ===
  { url: 'https://en.wikipedia.org/wiki/2015_Nashville_mayoral_election', note: 'Nashville 2015' },
  { url: 'https://en.wikipedia.org/wiki/2018_Nashville_mayoral_special_election', note: 'Nashville 2018 special' },
  { url: 'https://en.wikipedia.org/wiki/2019_Nashville_mayoral_election', note: 'Nashville 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Nashville_mayoral_election', note: 'Nashville 2023' },

  // === Charlotte ===
  { url: 'https://en.wikipedia.org/wiki/2013_Charlotte_mayoral_election', note: 'Charlotte 2013' },
  { url: 'https://en.wikipedia.org/wiki/2015_Charlotte_mayoral_election', note: 'Charlotte 2015' },
  { url: 'https://en.wikipedia.org/wiki/2017_Charlotte_mayoral_election', note: 'Charlotte 2017' },
  { url: 'https://en.wikipedia.org/wiki/2019_Charlotte_mayoral_election', note: 'Charlotte 2019' },
  { url: 'https://en.wikipedia.org/wiki/2022_Charlotte_mayoral_election', note: 'Charlotte 2022' },
  { url: 'https://en.wikipedia.org/wiki/2025_Charlotte_mayoral_election', note: 'Charlotte 2025' },

  // === San Diego ===
  { url: 'https://en.wikipedia.org/wiki/2014_San_Diego_special_mayoral_election', note: 'SD 2014 special' },
  { url: 'https://en.wikipedia.org/wiki/2014_San_Diego_mayoral_election', note: 'SD 2014' },
  { url: 'https://en.wikipedia.org/wiki/2020_San_Diego_mayoral_election', note: 'SD 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_San_Diego_mayoral_election', note: 'SD 2024' },

  // === Phoenix ===
  { url: 'https://en.wikipedia.org/wiki/2019_Phoenix_mayoral_election', note: 'Phoenix 2019' },
  { url: 'https://en.wikipedia.org/wiki/2020_Phoenix_mayoral_election', note: 'Phoenix 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_Phoenix_mayoral_election', note: 'Phoenix 2024' },

  // === San Jose ===
  { url: 'https://en.wikipedia.org/wiki/2014_San_Jose_mayoral_election', note: 'SJ 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_San_Jose_mayoral_election', note: 'SJ 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_San_Jose_mayoral_election', note: 'SJ 2022' },

  // === Austin ===
  { url: 'https://en.wikipedia.org/wiki/2014_Austin_mayoral_election', note: 'Austin 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_Austin_mayoral_election', note: 'Austin 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Austin_mayoral_election', note: 'Austin 2022' },

  // === Dallas ===
  { url: 'https://en.wikipedia.org/wiki/2015_Dallas_mayoral_election', note: 'Dallas 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Dallas_mayoral_election', note: 'Dallas 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Dallas_mayoral_election', note: 'Dallas 2023' },

  // === Indianapolis ===
  { url: 'https://en.wikipedia.org/wiki/2015_Indianapolis_mayoral_election', note: 'Indy 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Indianapolis_mayoral_election', note: 'Indy 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Indianapolis_mayoral_election', note: 'Indy 2023' },

  // === Columbus OH ===
  { url: 'https://en.wikipedia.org/wiki/2015_Columbus,_Ohio_mayoral_election', note: 'Columbus 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Columbus,_Ohio_mayoral_election', note: 'Columbus 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Columbus,_Ohio_mayoral_election', note: 'Columbus 2023' },

  // === Memphis ===
  { url: 'https://en.wikipedia.org/wiki/2015_Memphis_mayoral_election', note: 'Memphis 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Memphis_mayoral_election', note: 'Memphis 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Memphis_mayoral_election', note: 'Memphis 2023' },

  // === Milwaukee ===
  { url: 'https://en.wikipedia.org/wiki/2016_Milwaukee_mayoral_election', note: 'Milwaukee 2016' },
  { url: 'https://en.wikipedia.org/wiki/2020_Milwaukee_mayoral_election', note: 'Milwaukee 2020' },
  { url: 'https://en.wikipedia.org/wiki/2022_Milwaukee_mayoral_special_election', note: 'Milwaukee 2022 special' },
  { url: 'https://en.wikipedia.org/wiki/2024_Milwaukee_mayoral_election', note: 'Milwaukee 2024' },

  // === Albuquerque ===
  { url: 'https://en.wikipedia.org/wiki/2017_Albuquerque_mayoral_election', note: 'ABQ 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Albuquerque_mayoral_election', note: 'ABQ 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Albuquerque_mayoral_election', note: 'ABQ 2025' },

  // === Sacramento ===
  { url: 'https://en.wikipedia.org/wiki/2016_Sacramento_mayoral_election', note: 'Sac 2016' },
  { url: 'https://en.wikipedia.org/wiki/2020_Sacramento_mayoral_election', note: 'Sac 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_Sacramento_mayoral_election', note: 'Sac 2024' },

  // === Long Beach ===
  { url: 'https://en.wikipedia.org/wiki/2014_Long_Beach,_California_mayoral_election', note: 'LB 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_Long_Beach,_California_mayoral_election', note: 'LB 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Long_Beach,_California_mayoral_election', note: 'LB 2022' },

  // === Oakland ===
  { url: 'https://en.wikipedia.org/wiki/2014_Oakland_mayoral_election', note: 'Oakland 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_Oakland_mayoral_election', note: 'Oakland 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Oakland_mayoral_election', note: 'Oakland 2022' },
  { url: 'https://en.wikipedia.org/wiki/2025_Oakland_mayoral_special_election', note: 'Oakland 2025 special' },

  // === Tampa ===
  { url: 'https://en.wikipedia.org/wiki/2015_Tampa_mayoral_election', note: 'Tampa 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Tampa_mayoral_election', note: 'Tampa 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Tampa_mayoral_election', note: 'Tampa 2023' },

  // === Jacksonville ===
  { url: 'https://en.wikipedia.org/wiki/2015_Jacksonville_mayoral_election', note: 'Jax 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Jacksonville_mayoral_election', note: 'Jax 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Jacksonville_mayoral_election', note: 'Jax 2023' },

  // === Las Vegas ===
  { url: 'https://en.wikipedia.org/wiki/2015_Las_Vegas_mayoral_election', note: 'LV 2015' },
  { url: 'https://en.wikipedia.org/wiki/2019_Las_Vegas_mayoral_election', note: 'LV 2019' },
  { url: 'https://en.wikipedia.org/wiki/2024_Las_Vegas_mayoral_election', note: 'LV 2024' },

  // === Tucson ===
  { url: 'https://en.wikipedia.org/wiki/2019_Tucson_mayoral_election', note: 'Tucson 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Tucson_mayoral_election', note: 'Tucson 2023' },

  // === Other big-city mayoral elections ===
  { url: 'https://en.wikipedia.org/wiki/2018_Anchorage_mayoral_election', note: 'Anchorage 2018' },
  { url: 'https://en.wikipedia.org/wiki/2021_Anchorage_mayoral_election', note: 'Anchorage 2021' },
  { url: 'https://en.wikipedia.org/wiki/2024_Anchorage_mayoral_election', note: 'Anchorage 2024' },
  { url: 'https://en.wikipedia.org/wiki/2017_Honolulu_mayoral_election', note: 'Honolulu 2017' },
  { url: 'https://en.wikipedia.org/wiki/2020_Honolulu_mayoral_election', note: 'Honolulu 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_Honolulu_mayoral_election', note: 'Honolulu 2024' },
  { url: 'https://en.wikipedia.org/wiki/2014_Newark_mayoral_election', note: 'Newark 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_Newark_mayoral_election', note: 'Newark 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Newark_mayoral_election', note: 'Newark 2022' },
  { url: 'https://en.wikipedia.org/wiki/2017_Jersey_City_mayoral_election', note: 'Jersey City 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Jersey_City_mayoral_election', note: 'Jersey City 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Jersey_City_mayoral_election', note: 'Jersey City 2025' },
  { url: 'https://en.wikipedia.org/wiki/2017_Buffalo_mayoral_election', note: 'Buffalo 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Buffalo_mayoral_election', note: 'Buffalo 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Buffalo_mayoral_election', note: 'Buffalo 2025' },
  { url: 'https://en.wikipedia.org/wiki/2017_Cincinnati_mayoral_election', note: 'Cincinnati 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Cincinnati_mayoral_election', note: 'Cincinnati 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Cincinnati_mayoral_election', note: 'Cincinnati 2025' },
  { url: 'https://en.wikipedia.org/wiki/2014_Lexington,_Kentucky_mayoral_election', note: 'Lexington 2014' },
  { url: 'https://en.wikipedia.org/wiki/2018_Lexington,_Kentucky_mayoral_election', note: 'Lexington 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Lexington,_Kentucky_mayoral_election', note: 'Lexington 2022' },
  { url: 'https://en.wikipedia.org/wiki/2018_Louisville_mayoral_election', note: 'Louisville 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Louisville_mayoral_election', note: 'Louisville 2022' },
  { url: 'https://en.wikipedia.org/wiki/2017_Birmingham,_Alabama_mayoral_election', note: 'Birmingham 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Birmingham,_Alabama_mayoral_election', note: 'Birmingham 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Birmingham,_Alabama_mayoral_election', note: 'Birmingham 2025' },
  { url: 'https://en.wikipedia.org/wiki/2018_Tucson_mayoral_election', note: 'Tucson 2018' },
  { url: 'https://en.wikipedia.org/wiki/2017_Salt_Lake_City_mayoral_election', note: 'SLC 2017' },
  { url: 'https://en.wikipedia.org/wiki/2019_Salt_Lake_City_mayoral_election', note: 'SLC 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Salt_Lake_City_mayoral_election', note: 'SLC 2023' },
  { url: 'https://en.wikipedia.org/wiki/2018_Madison,_Wisconsin_mayoral_election', note: 'Madison 2018' },
  { url: 'https://en.wikipedia.org/wiki/2019_Madison,_Wisconsin_mayoral_election', note: 'Madison 2019' },
  { url: 'https://en.wikipedia.org/wiki/2023_Madison,_Wisconsin_mayoral_election', note: 'Madison 2023' },
  { url: 'https://en.wikipedia.org/wiki/2017_St._Paul_mayoral_election', note: 'St Paul 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_St._Paul_mayoral_election', note: 'St Paul 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_St._Paul_mayoral_election', note: 'St Paul 2025' },
  { url: 'https://en.wikipedia.org/wiki/2017_Omaha_mayoral_election', note: 'Omaha 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_Omaha_mayoral_election', note: 'Omaha 2021' },
  { url: 'https://en.wikipedia.org/wiki/2025_Omaha_mayoral_election', note: 'Omaha 2025' },
  { url: 'https://en.wikipedia.org/wiki/2017_Oklahoma_City_mayoral_election', note: 'OKC 2017' },
  { url: 'https://en.wikipedia.org/wiki/2018_Oklahoma_City_mayoral_election', note: 'OKC 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Oklahoma_City_mayoral_election', note: 'OKC 2022' },
  { url: 'https://en.wikipedia.org/wiki/2017_Tulsa_mayoral_election', note: 'Tulsa 2017' },
  { url: 'https://en.wikipedia.org/wiki/2020_Tulsa_mayoral_election', note: 'Tulsa 2020' },
  { url: 'https://en.wikipedia.org/wiki/2024_Tulsa_mayoral_election', note: 'Tulsa 2024' },
  { url: 'https://en.wikipedia.org/wiki/2018_Providence_mayoral_election', note: 'Providence 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Providence_mayoral_election', note: 'Providence 2022' },
  { url: 'https://en.wikipedia.org/wiki/2017_Tallahassee_mayoral_election', note: 'Tallahassee 2017' },
  { url: 'https://en.wikipedia.org/wiki/2018_Tallahassee_mayoral_election', note: 'Tallahassee 2018' },
  { url: 'https://en.wikipedia.org/wiki/2022_Tallahassee_mayoral_election', note: 'Tallahassee 2022' },
  { url: 'https://en.wikipedia.org/wiki/2017_St._Petersburg,_Florida_mayoral_election', note: 'St Pete 2017' },
  { url: 'https://en.wikipedia.org/wiki/2021_St._Petersburg,_Florida_mayoral_election', note: 'St Pete 2021' },
  { url: 'https://en.wikipedia.org/wiki/2017_Worcester_mayoral_election', note: 'Worcester 2017' },
  { url: 'https://en.wikipedia.org/wiki/2017_Reno_mayoral_election', note: 'Reno 2018' },
]
