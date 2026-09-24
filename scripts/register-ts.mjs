#!/usr/bin/env node
/** Registers the TypeScript resolve hook for direct `node script.mjs` runs. */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./ts-resolve.mjs', pathToFileURL(`${import.meta.dirname}/`));
