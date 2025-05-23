import path from "path";
import chalk from "chalk";

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { BundleInfo, PlatformType } from "./BundleInfo.js";
import { rootDir } from "../cli.js";
import { getOutputDir, getPlatformsFromPath, normalizePath } from "../utils/Utils.js";

export function getPolyfillBundle(bundleName, platformType: PlatformType, outputDir?: string): BundleInfo[] {
  const platformsPath = path.join(rootDir, `src/platforms`);
  const platforms = getPlatformsFromPath(platformsPath);
  console.log(`Found polyfill, including: ${chalk.green(platforms)}.`);

  let bundles: BundleInfo[] = [];
  for (const platform of platforms) {
    console.log(`Prepare polyfill bundle info for ${chalk.green(platform)}.`);
    bundles.push({
      bundleName: bundleName,
      entry: normalizePath(path.join(platformsPath, `${platform}/${platformType}/polyfill/index.js`)),
      output: {
        file: normalizePath(path.join(getOutputDir(outputDir), `dist/${platform}/${platformType}/${bundleName}.js`)),
        format: 'cjs',
      },
      platformName: platform,
      platformType: platformType,
      bundleType: 'Adapter',
      rollupPlugins: [
        resolve(),
        commonjs()
      ],
      needUglify: true,
    });
  }
  console.log(`Prepare polyfill bundle info complete.`);
  return bundles;
}
