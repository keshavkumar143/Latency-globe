/**
 * Third-party URLs the browser measures or calls. All of them allow cross-origin use from
 * a browser, either through CORS or because they're only timed with no-cors requests.
 */
export const EXTERNAL_URLS = Object.freeze({
  /** DynamoDB's unauthenticated health check in each AWS region. */
  awsPing: (regionCode) => `https://dynamodb.${regionCode}.amazonaws.com/ping`,

  /** Appended to each GCP region's gcping base URL (see data/gcpPingUrls.json). */
  gcpPingPath: '/api/ping',

  /** Azure AI Services' regional host. It answers without a key, so it works as a regional ping target. */
  azurePing: (regionCode) => `https://${regionCode}.api.cognitive.microsoft.com/`,

  /** Cloudflare is anycast: this reaches whichever edge is nearest to the user. */
  cloudflareTrace: 'https://www.cloudflare.com/cdn-cgi/trace',
  /** Same trace on another hostname, read once to learn the edge's location without warming the timed connection. */
  cloudflareTraceForLocation: 'https://speed.cloudflare.com/cdn-cgi/trace',

  /** Cloudflare DNS-over-HTTPS, JSON API. */
  dnsOverHttps: 'https://cloudflare-dns.com/dns-query',

  /** IP geolocation for the user's own IP, tried in order. */
  geojsIpLookup: 'https://get.geojs.io/v1/ip/geo.json',
  ipwhoisIpLookup: 'https://ipwho.is/',
  /** IP geolocation + network owner for any IP. */
  ipwhoisLookup: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}`,

  /** Esri basemaps: free with on-screen attribution, CORS-enabled, detailed down to street level. */
  esriImageryTile: (x, y, level) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${level}/${y}/${x}`,
  esriDarkGrayTile: (x, y, level) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${level}/${y}/${x}`,
  esriStreetTile: (x, y, level) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${level}/${y}/${x}`,
});
