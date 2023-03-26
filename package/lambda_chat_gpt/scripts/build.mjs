import * as esbuild from "esbuild";
import pkg from "../package.json" assert { type: "json" };
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const unbundleModules = ["@aws-sdk/*"];

// From package root.
const outdir = "./dist";
const packageLockJSONPath = "../../package-lock.json";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  outfile: `${outdir}/index.mjs`,
  platform: "node",
  format: "esm",
  minify: false,
  sourcemap: true,
  bundle: true,
  external: unbundleModules,
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
});

const extractedDependencies = Object.keys(pkg.dependencies)
  .filter((key) => unbundleModules.includes(key))
  .reduce((obj, key) => {
    obj[key] = pkg.dependencies[key];
    return obj;
  }, {});

const extractedPackageJSON = {
  dependencies: extractedDependencies,
};

writeFileSync(`${outdir}/package.json`, JSON.stringify(extractedPackageJSON));
execSync(`cp ${packageLockJSONPath} ${outdir}`);
execSync(`cd ${outdir} && npm ci --production`);
