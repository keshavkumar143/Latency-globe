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

  /**
   * Cloudflare's speed-test metadata: the user's nearest edge ("colo") and Cloudflare's IP geolocation of the user.
   * Unlike /cdn-cgi/trace, it isn't on privacy filter lists (EasyPrivacy blocks cloudflare.com/cdn-cgi/trace).
   */
  cloudflareMeta: 'https://speed.cloudflare.com/meta',
  /** Fallback edge lookup when /meta fails; blocked by EasyPrivacy, so it only helps in browsers without it. */
  cloudflareTrace: 'https://speed.cloudflare.com/cdn-cgi/trace',
  /**
   * Timed to measure the nearest Cloudflare edge: Cloudflare's DNS-over-HTTPS resolver answers at the edge itself
   * (~1 ms server time; speed.cloudflare.com/__down adds ~30 ms of Worker time) and isn't on filter lists.
   */
  cloudflareEdgePing: 'https://cloudflare-dns.com/dns-query?name=cloudflare.com&type=A&ct=application/dns-json',

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
