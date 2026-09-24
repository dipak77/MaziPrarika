/**
 * Node ESM resolve hook: allow TypeScript sources to be executed directly.
 *
 * Our packages are written with NodeNext-style `./foo.js` specifiers (correct
 * for tsc and bundlers), but the runtime files on disk are `./foo.ts`. Node's
 * type stripping executes `.ts` happily — it just cannot guess the extension.
 * This hook retries a failed relative `.js` resolve as `.ts`/`.tsx`.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const isRelativeJs = /^\.\.?\//.test(specifier) && specifier.endsWith('.js');
    if (!isRelativeJs || !context.parentURL) throw error;

    for (const extension of ['.ts', '.tsx']) {
      const candidate = new URL(specifier.replace(/\.js$/, extension), context.parentURL);
      if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
    }
    throw error;
  }
}
