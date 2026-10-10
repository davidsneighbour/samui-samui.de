import { runEnrichment } from './enrichment.ts';

try {
  process.exitCode = await runEnrichment(process.argv.slice(2), true);
} catch (error) {
  console.error(String(error));
  process.exitCode = 1;
}
