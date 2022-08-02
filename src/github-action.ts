import core from '@actions/core';
import {authenticate, InstallationAuthentication} from './authenticate.js';
import {options} from './options.js';

async function run(
  auth: typeof authenticate,
): Promise<InstallationAuthentication> {
  try {
    const inputs = {
      appId: core.getInput('appId', {required: true}),
      privateKey: core.getInput('privateKey', {required: true}),
      repositories: core.getMultilineInput('repositories', {required: true}),
      owner: core.getInput('owner'),
      installationId: core.getInput('installationId'),
    };

    const parsedOptions = options.parse(inputs);
    const installationAuth = await auth(parsedOptions);

    core.setOutput('token', installationAuth.token);
    core.setOutput('createdAt', installationAuth.createdAt);
    core.setOutput('expiresAt', installationAuth.expiresAt);

    return installationAuth;
  } catch (error: unknown) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export {run};
