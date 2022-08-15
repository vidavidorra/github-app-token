import core from '@actions/core';
import {authenticate} from './authenticate.js';

async function run(auth: typeof authenticate): Promise<void> {
  try {
    const inputs = {
      appId: core.getInput('appId', {required: true}),
      privateKey: core.getInput('privateKey', {required: true}),
      repositories: new Set(
        core.getMultilineInput('repositories', {required: true}),
      ),
      owner: core.getInput('owner'),
      installationId: core.getInput('installationId'),
      includeUserInformation: core.getBooleanInput('includeUserInformation'),
    };

    const installationAuth = await auth(inputs);

    core.setOutput('token', installationAuth.token);
    core.setOutput('createdAt', installationAuth.createdAt);
    core.setOutput('expiresAt', installationAuth.expiresAt);

    if (installationAuth.includesUserInformation) {
      core.setOutput('username', installationAuth.username);
      core.setOutput('email', installationAuth.email);
    }
  } catch (error: unknown) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export {run};
