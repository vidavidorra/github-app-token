const config = {
  '*.{ts,tsx,js,jsx}': [
    'xo --fix',
    () => 'ava',
    () => 'npm run bundle-github-action',
    () => 'prettier --write test/fixtures/',
  ],
  '*.{vue,css,less,scss,html,htm,json,md,markdown,yml,yaml}':
    'prettier --write',
};

export default config;
