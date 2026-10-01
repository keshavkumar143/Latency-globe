export const PROVIDER_ID = Object.freeze({
  AWS: 'aws',
  GCP: 'gcp',
  AZURE: 'azure',
  CLOUDFLARE: 'cloudflare',
});

/** Brand-adjacent colors, picked to stay distinct from the blue/amber/red latency colors. */
export const PROVIDERS = Object.freeze({
  [PROVIDER_ID.AWS]: { id: PROVIDER_ID.AWS, label: 'AWS', name: 'Amazon Web Services', color: '#ff9900' },
  [PROVIDER_ID.GCP]: { id: PROVIDER_ID.GCP, label: 'GCP', name: 'Google Cloud', color: '#34a853' },
  [PROVIDER_ID.AZURE]: { id: PROVIDER_ID.AZURE, label: 'Azure', name: 'Microsoft Azure', color: '#3ccbf4' },
  [PROVIDER_ID.CLOUDFLARE]: { id: PROVIDER_ID.CLOUDFLARE, label: 'Cloudflare', name: 'Cloudflare', color: '#f6821f' },
});

/** Filter value that shows every provider. */
export const ALL_PROVIDERS = 'all';
