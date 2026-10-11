// Lets Node's test runner import the app's TypeScript modules as the bundler does:
// "@/..." points to src/, and imports without an extension try ".ts" and ".tsx".
// Used only by `npm test` (node --import ./tests/resolve-ts.mjs). No dependencies.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
      import { pathToFileURL } from "node:url";
      const src = pathToFileURL(process.cwd() + "/src/").href;
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith("@/")) specifier = src + specifier.slice(2);
        try {
          return await next(specifier, context);
        } catch (error) {
          if (!/^(\\.|\\/|file:)/.test(specifier) || /\\.[cm]?[jt]sx?$/.test(specifier)) throw error;
          for (const ext of [".ts", ".tsx", "/index.ts"]) {
            try {
              return await next(specifier + ext, context);
            } catch {}
          }
          throw error;
        }
      }
    `),
  import.meta.url,
);
