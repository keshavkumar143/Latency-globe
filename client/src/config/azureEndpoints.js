/**
 * Optional per-region overrides for Azure ping targets.
 *
 * By default each Azure region is timed against its Azure AI Services host
 * (https://<region>.api.cognitive.microsoft.com/), which needs no setup. To time your own
 * storage accounts instead, map region codes to the URL of a tiny public blob:
 *
 *   eastus: 'https://<account>.blob.core.windows.net/<container>/ping.txt',
 */
export const AZURE_ENDPOINT_OVERRIDES = Object.freeze({});
