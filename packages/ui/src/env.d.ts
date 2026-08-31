/**
 * `process.env.NODE_ENV` is replaced at build time by every bundler that targets the
 * browser, so the dev-only warnings compile away in production. Declaring just this
 * shape avoids pulling @types/node into a package that never touches Node — and
 * avoids conflicting with a consumer's own Node types, since it is not emitted.
 */
declare const process: { env: { NODE_ENV?: string } };
