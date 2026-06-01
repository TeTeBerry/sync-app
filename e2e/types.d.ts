/** Ambient types for miniprogram-automator (package ships without `types` in package.json). */
declare module 'miniprogram-automator' {
  import type Automator from 'miniprogram-automator/out/Automator';

  const automator: Automator;
  export = automator;
}
