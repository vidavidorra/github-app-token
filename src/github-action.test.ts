import {fake, stub, type SinonStub} from 'sinon';
import core from '@actions/core';
import anyTest, {type TestFn} from 'ava';
import {config} from './_config.test.js';
import {type InstallationAuthentication} from './authenticate.js';
import {run} from './github-action.js';

const test = anyTest as TestFn<{
  getInput: SinonStub;
  getBooleanInput: SinonStub;
  getMultilineInput: SinonStub;
  setOutput: SinonStub;
}>;

const installationAuthentication: InstallationAuthentication = {
  token: 'ghs_gaCxrLk7CwZQ70nDBvPLQemUXd1R6O25qUMB',
  createdAt: '2022-06-01T12:00:00Z',
  expiresAt: '2022-06-01T13:00:00Z',
  includesUserInformation: false,
} as const;

const fakeInputs: Record<string, string> = {
  appId: config.app.withOneInstallation.id.toString(),
  privateKey: config.app.withOneInstallation.privateKey,
  owner: config.app.withOneInstallation.owner,
  installationId: config.app.withOneInstallation.installationId.toString(),
};

function getInputMock(name: string): string {
  return fakeInputs[name];
}

test.beforeEach((t) => {
  t.context.getBooleanInput = stub(core, 'getBooleanInput').callsFake(
    () => false,
  );
  t.context.getInput = stub(core, 'getInput').callsFake(getInputMock);
  t.context.getMultilineInput = stub(core, 'getMultilineInput').callsFake(
    () => [config.repository],
  );
  t.context.setOutput = stub(core, 'setOutput');
});

test.afterEach((t) => {
  t.context.getBooleanInput.restore();
  t.context.getInput.restore();
  t.context.getMultilineInput.restore();
  t.context.setOutput.restore();
});

test.serial('calls the "authenticate" function', async (t) => {
  const authenticate = fake.resolves(installationAuthentication);
  await run(authenticate);

  t.is(authenticate.callCount, 1);
  t.is(t.context.setOutput.callCount, 3);
});

test.serial(
  'sets "token" output from the "authenticate" return value',
  async (t) => {
    await run(fake.resolves(installationAuthentication));

    t.true(
      t.context.setOutput.calledWith('token', installationAuthentication.token),
    );
  },
);

test.serial(
  'sets "createdAt" output from the "authenticate" return value',
  async (t) => {
    await run(fake.resolves(installationAuthentication));

    t.true(
      t.context.setOutput.calledWith(
        'createdAt',
        installationAuthentication.createdAt,
      ),
    );
  },
);

test.serial(
  'sets "expiresAt" output from the "authenticate" return value',
  async (t) => {
    await run(fake.resolves(installationAuthentication));

    t.true(
      t.context.setOutput.calledWith(
        'expiresAt',
        installationAuthentication.expiresAt,
      ),
    );
  },
);

test.serial(
  'does not set "username" and "email" outputs without "includesUserInformation"',
  async (t) => {
    await run(fake.resolves(installationAuthentication));

    t.false(t.context.setOutput.calledWith('username'));
    t.false(t.context.setOutput.calledWith('email'));
  },
);

test.serial(
  'sets "email" and "username" outputs from the "authenticate" return value with "includesUserInformation"',
  async (t) => {
    const username = 'amoore';
    const email = 'amoore@example.com';
    await run(
      fake.resolves({
        ...installationAuthentication,
        includesUserInformation: true,
        email,
        username,
      }),
    );

    t.true(t.context.setOutput.calledWith('username', username));
    t.true(t.context.setOutput.calledWith('email', email));
  },
);
