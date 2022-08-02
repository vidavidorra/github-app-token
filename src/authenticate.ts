import {createAppAuth} from '@octokit/auth-app';
import {getOctokit} from '@actions/github';
import {Options} from './options.js';

interface InstallationAuthentication {
  token: string;
  createdAt: string;
  expiresAt: string;
}

async function authenticate(
  options: Options,
): Promise<InstallationAuthentication> {
  const auth = createAppAuth({
    appId: options.appId,
    privateKey: options.privateKey,
  });
  const appAuth = await auth({type: 'app'});
  const octokit = getOctokit(appAuth.token);

  let {installationId} = options;
  if (installationId === undefined) {
    const installations = await octokit.rest.apps.listInstallations();
    if (installations.data.length === 0) {
      throw new Error('The GitHub App must have at least one installation');
    }

    if (options.owner === undefined && installations.data.length > 1) {
      throw new Error(
        'Without "owner", the GitHub App must have exactly one installation',
      );
    }

    if (options.owner === undefined) {
      installationId = installations.data.at(0)?.id;
    } else {
      const installation = installations.data.find(
        (installation) =>
          installation.account?.login === options.owner ||
          installation.account?.slug === options.owner,
      );
      if (installation === undefined) {
        throw new Error('The "owner" must have the GitHub App installed');
      }

      installationId = installation.id;
    }
  }

  const installationAuth = await auth({
    installationId,
    type: 'installation',
    repositoryNames: [...options.repositories],
  });

  return {
    token: installationAuth.token,
    createdAt: installationAuth.createdAt,
    expiresAt: installationAuth.expiresAt,
  };
}

export default authenticate;
export {authenticate, InstallationAuthentication};
