import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const rootDir = path.join(__dirname, '..');

export function parseArgs() {
  return yargs(process.argv).options({
    polyfill: {
      alias: 'p',
      type: 'boolean',
      default: false,
      describe: 'Enable build polyfills.'
    },
    engine: {
      alias: 'e',
      type: 'array',
      default: [],
      describe: 'Specify the engine modules\' path to target for your build.'
    },
    wasm: {
      alias: 'w',
      type: 'array',
      default: [],
      describe: 'The wasm file to be upload'
    },
    jsWASMLoader: {
      alias: 'wl',
      type: 'array',
      default: [],
      describe: 'Specify the jsWASMLoader modules\' path to target for your build.'
    },
    output: {
      alias: 'o',
      type: 'string',
      default: undefined,
      describe: 'Specify the output directory for your build. If not specified, the output directory will be currently command directory.'
    }
  })
  .help()
  .argv as { polyfill?: boolean, engine?: string[], wasm?: string[], jsWASMLoader?: string[], output?: string };
}
