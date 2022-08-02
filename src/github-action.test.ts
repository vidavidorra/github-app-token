import {fake, stub, SinonStub} from 'sinon';
import core from '@actions/core';
import anyTest, {TestFn} from 'ava';
import config from '../test/config.js';
import {InstallationAuthentication} from './authenticate.js';
import {run} from './github-action.js';

const test = anyTest as TestFn<{
  getInput: SinonStub;
  getMultilineInput: SinonStub;
  setOutput: SinonStub;
}>;

const installationAuthentication: InstallationAuthentication = {
  token: 'ghs_gaCxrLk7CwZQ70nDBvPLQemUXd1R6O25qUMB',
  createdAt: '2022-06-01T12:00:00Z',
  expiresAt: '2022-06-01T13:00:00Z',
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
  t.context.getInput = stub(core, 'getInput').callsFake(getInputMock);
  t.context.getMultilineInput = stub(core, 'getMultilineInput').callsFake(
    () => [config.repository],
  );
  t.context.setOutput = stub(core, 'setOutput');
});

test.afterEach((t) => {
  t.context.getInput.restore();
  t.context.getMultilineInput.restore();
  t.context.setOutput.restore();
});

test.serial('calls the "authenticate" function', async (t) => {
  const authenticate = fake.resolves(installationAuthentication);
  const auth = await run(authenticate);
  t.true(auth.token !== undefined);
  t.is(authenticate.callCount, 1);
  t.is(t.context.setOutput.callCount, 3);
});

test.serial(
  'sets "token" output from the "authenticate" return value',
  async (t) => {
    const authentication = await run(fake.resolves(installationAuthentication));
    t.is(authentication.token, installationAuthentication.token);

    t.true(
      t.context.setOutput.calledWith('token', installationAuthentication.token),
    );
  },
);
