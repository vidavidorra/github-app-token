import {createAppAuth} from '@octokit/auth-app';
import {getOctokit} from '@actions/github';
import {Options, Input, options as optionsSchema} from './options.js';

interface InstallationAuthenticationWithoutUserInformation {
  token: string;
  createdAt: string;
  expiresAt: string;
  includesUserInformation: false;
}

interface UserInformation {
  email: string;
  username: string;
}

type InstallationAuthenticationWithUserInformation = Omit<
  InstallationAuthenticationWithoutUserInformation,
  'includesUserInformation'
> & {includesUserInformation: true} & UserInformation;

type InstallationAuthentication =
  | InstallationAuthenticationWithoutUserInformation
  | InstallationAuthenticationWithUserInformation;

class Authenticate {
  private readonly _options: Options;
  constructor(options: Input) {
    this._options = optionsSchema.parse(options);
  }

  async authenticate(): Promise<InstallationAuthentication> {
    const auth = createAppAuth({
      appId: this._options.appId,
      privateKey: this._options.privateKey,
    });
    const appAuth = await auth({type: 'app'});
    const octokit = getOctokit(appAuth.token);

    const installationId = await this.installationId(octokit);
    const installationAuth = await auth({
      installationId,
      type: 'installation',
      repositoryNames: [...this._options.repositories],
    });
    const installationAuthentication: InstallationAuthentication = {
      token: installationAuth.token,
      createdAt: installationAuth.createdAt,
      expiresAt: installationAuth.expiresAt,
      includesUserInformation: false,
    };

    if (this._options.includeUserInformation) {
      const userInformation = await this.userInformation(
        octokit,
        installationAuthentication.token,
      );

      if (userInformation !== undefined) {
        return {
          ...installationAuthentication,
          includesUserInformation: true,
          username: userInformation.username,
          email: userInformation.email,
        };
      }
    }

    return installationAuthentication;
  }

  private async installationId(
    octokit: ReturnType<typeof getOctokit>,
  ): Promise<number> {
    if (this._options.installationId !== undefined) {
      return this._options.installationId;
    }

    const installations = await octokit.rest.apps.listInstallations();
    if (installations.data.length === 0) {
      throw new Error('The GitHub App must have at least one installation');
    }

    if (this._options.owner === undefined && installations.data.length > 1) {
      throw new Error(
        'Without "owner", the GitHub App must have exactly one installation',
      );
    }

    if (this._options.owner === undefined) {
      return installations.data[0].id;
    }

    const installation = installations.data.find(
      (installation) =>
        installation.account?.login === this._options.owner ||
        installation.account?.slug === this._options.owner,
    );
    if (installation === undefined) {
      throw new Error('The "owner" must have the GitHub App installed');
    }

    return installation.id;
  }

  private async userInformation(
    octokit: ReturnType<typeof getOctokit>,
    token: string,
  ): Promise<UserInformation | undefined> {
    const app = await octokit.rest.apps.getAuthenticated();
    if (app.data.slug === undefined) {
      return undefined;
    }

    const username = `${app.data.slug}[bot]`;
    const user = await getOctokit(token).rest.users.getByUsername({username});
    const email = `${user.data.id}+${username}@users.noreply.github.com`;

    return {username, email};
  }
}

async function authenticate(
  options: Input,
): Promise<InstallationAuthentication> {
  return new Authenticate(options).authenticate();
}

export default authenticate;
export {authenticate, InstallationAuthentication};
