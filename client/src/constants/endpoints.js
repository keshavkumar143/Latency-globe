/**
 * External URLs the browser measures or calls.
 */
export const ENDPOINTS = Object.freeze({
  /** DynamoDB's unauthenticated health check. Replies "healthy: dynamodb.<region>.amazonaws.com". */
  awsPing: (regionCode) => `https://dynamodb.${regionCode}.amazonaws.com/ping`,
});
