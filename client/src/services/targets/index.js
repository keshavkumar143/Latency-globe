import { buildAwsTargets } from './awsTargets';

/**
 * Every region target across all providers. Each provider adds its own builder here.
 * @returns {import('@/types/latency').Target[]}
 */
export function buildAllTargets() {
  return [...buildAwsTargets()];
}
