import { register } from 'node:module';

register('./client-boundary-loader.mjs', import.meta.url);
