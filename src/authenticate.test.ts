import test from 'ava';
import nock from 'nock';
// Import {RequestError} from '@octokit/request-error';
import config from '../test/config.js';
import {authenticate} from './authenticate.js';

const {back} = nock;
back.setMode(config.nockBackMode);
back.fixtures = config.fixturesPath;

test.serial('succeeds for an app with one installation', async (t) => {
  const {nockDone} = await back('app-one-installation.json');
  await t.notThrowsAsync(
    authenticate({
      appId: config.app.withOneInstallation.id,
      privateKey: config.app.withOneInstallation.privateKey,
      repositories: new Set([config.repository]),
    }),
  );
  nockDone();
});

test.serial(
  'succeeds for an app with one installation and "owner"',
  async (t) => {
    const {nockDone} = await back('app-one-installation-with-owner.json');
    await t.notThrowsAsync(
      authenticate({
        appId: config.app.withOneInstallation.id,
        privateKey: config.app.withOneInstallation.privateKey,
        repositories: new Set([config.repository]),
        owner: config.app.withOneInstallation.owner,
      }),
    );
    nockDone();
  },
);

test.serial(
  'succeeds for an app with one installation and "installationId"',
  async (t) => {
    const {nockDone} = await back(
      'app-one-installation-with-installation-id.json',
    );
    await t.notThrowsAsync(
      authenticate({
        appId: config.app.withOneInstallation.id,
        privateKey: config.app.withOneInstallation.privateKey,
        repositories: new Set([config.repository]),
        installationId: config.app.withOneInstallation.installationId,
      }),
    );
    nockDone();
  },
);

test.serial(
  'succeeds for an app with one installation, "owner" and "installationId"',
  async (t) => {
    const {nockDone} = await back(
      'app-one-installation-with-owner-and-installation-id.json',
    );
    await t.notThrowsAsync(
      authenticate({
        appId: config.app.withOneInstallation.id,
        privateKey: config.app.withOneInstallation.privateKey,
        repositories: new Set([config.repository]),
        owner: config.app.withOneInstallation.owner,
        installationId: config.app.withOneInstallation.installationId,
      }),
    );
    nockDone();
  },
);

test.serial(
  'throws an error for an app with one installation not belonging to "owner"',
  async (t) => {
    const owner = 'alan-moore';
    t.not(owner, config.app.withOneInstallation.owner);

    const {nockDone} = await back('app-one-installations-wrong-owner.json');
    await t.throwsAsync(
      authenticate({
        appId: config.app.withOneInstallation.id,
        privateKey: config.app.withOneInstallation.privateKey,
        repositories: new Set([config.repository]),
        owner,
      }),
      {
        instanceOf: Error,
        message: 'The "owner" must have the GitHub App installed',
      },
    );
    nockDone();
  },
);

test.serial('throws an error if "appId" is invalid', async (t) => {
  const {nockDone} = await back('invalid-app-id.json');
  await t.throwsAsync(
    authenticate({
      appId: 1,
      privateKey: config.app.withOneInstallation.privateKey,
      repositories: new Set([config.repository]),
    }),
    {
      // InstanceOf: RequestError,
      message: 'Integration not found',
    },
  );
  nockDone();
});

test.serial('throws an error if "privateKey" is invalid', async (t) => {
  const {nockDone} = await back('invalid-private-key.json');
  await t.throwsAsync(
    authenticate({
      appId: config.app.withOneInstallation.id,
      privateKey: [
        '-----BEGIN RSA PRIVATE KEY-----',
        'MIIBOgIBAAJBALhs0pYlr1BM/wFyLkJKVRCE7PMryIUAsGvK0KtgRZRizqFjBtkM',
        'DReuBiKAZQFo7VmI/nVVtC9K9cOk3lPqXrsCAwEAAQJACV7uLFbp24iuBGLK2u9v',
        '9xDqAUkePTPVwwRhKfQQVQPCCEbkwfoClggx+4mbx0GrDJQaeilwU7EZcWrcJiTt',
        'AQIhAPLVodfFZggWl0hpRRirb44PLFgE08ES947gUk2QwQxBAiEAwmyChs2hq9Ln',
        'E4noK4UQuCQkculdUZURC/rS1FY4m/sCIEl/l6izOpqgG9Hy6tL4sJ8SwJ0zeNQr',
        'ZXp9Muv/MC8BAiEAvl2SvD0RZHT/bqEkI6CJi1NQIPegOKY1Z75yuhemHAsCIAik',
        'vmZS6n+4AouMuyb4Mgm8egy8SQcGhJ3/QIVr16yX',
        '-----END RSA PRIVATE KEY-----',
      ].join('\n'),
      repositories: new Set([config.repository]),
    }),
    {
      // InstanceOf: re.RequestError,
      message: 'A JSON web token could not be decoded',
    },
  );
  nockDone();
});

test.serial('throws an error if "installationId" is invalid', async (t) => {
  const {nockDone} = await back('invalid-installation-id.json');
  await t.throwsAsync(
    authenticate({
      appId: config.app.withOneInstallation.id,
      privateKey: config.app.withOneInstallation.privateKey,
      repositories: new Set([config.repository]),
      installationId: 1,
    }),
    {
      // InstanceOf: re.RequestError,
      message: 'Not Found',
    },
  );
  nockDone();
});

test.serial('throws an error for an app without installation', async (t) => {
  const {nockDone} = await back('app-without-installation.json');
  await t.throwsAsync(
    authenticate({
      appId: config.app.withoutInstallation.id,
      privateKey: config.app.withoutInstallation.privateKey,
      repositories: new Set(['scarlet-macaw']),
    }),
    {
      instanceOf: Error,
      message: 'The GitHub App must have at least one installation',
    },
  );
  nockDone();
});

test.serial(
  'succeeds for an app with two installations and "owner"',
  async (t) => {
    const {nockDone} = await back('app-two-installations-with-owner.json');
    await t.notThrowsAsync(
      authenticate({
        appId: config.app.withTwoInstallations.id,
        privateKey: config.app.withTwoInstallations.privateKey,
        repositories: new Set([config.repository]),
        owner: config.app.withTwoInstallations.owner,
      }),
    );
    nockDone();
  },
);

test.serial(
  'succeeds for an app with two installations and "owner" and "installationId"',
  async (t) => {
    const {nockDone} = await back(
      'app-two-installations-with-owner-and-installation-id.json',
    );
    await t.notThrowsAsync(
      authenticate({
        appId: config.app.withTwoInstallations.id,
        privateKey: config.app.withTwoInstallations.privateKey,
        repositories: new Set([config.repository]),
        owner: config.app.withTwoInstallations.owner,
        installationId: config.app.withTwoInstallations.installationId,
      }),
    );
    nockDone();
  },
);

test.serial(
  'throws an error for an app with two installations without "owner"',
  async (t) => {
    const {nockDone} = await back('app-two-installations.json');
    await t.throwsAsync(
      authenticate({
        appId: config.app.withTwoInstallations.id,
        privateKey: config.app.withTwoInstallations.privateKey,
        repositories: new Set([config.repository]),
      }),
      {
        instanceOf: Error,
        message:
          'Without "owner", the GitHub App must have exactly one installation',
      },
    );
    nockDone();
  },
);

test.serial(
  'throws an error for an app with two installations not belonging to "owner"',
  async (t) => {
    const owner = 'alan-moore';
    t.not(owner, config.app.withTwoInstallations.owner);

    const {nockDone} = await back('app-two-installations-wrong-owner.json');
    await t.throwsAsync(
      authenticate({
        appId: config.app.withTwoInstallations.id,
        privateKey: config.app.withTwoInstallations.privateKey,
        repositories: new Set([config.repository]),
        owner,
      }),
      {
        instanceOf: Error,
        message: 'The "owner" must have the GitHub App installed',
      },
    );
    nockDone();
  },
);
