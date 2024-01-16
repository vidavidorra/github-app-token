import authApp from '@octokit/auth-app';
import github from '@actions/github';
import {type Options, type Input, options as optionsSchema} from './options.js';
import {installationId} from './installation-id.js';

type InstallationAuthenticationWithoutUserInformation = {
  token: string;
  createdAt: string;
  expiresAt: string;
  includesUserInformation: false;
};

type UserInformation = {
  email: string;
  username: string;
};

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
    console.log('authenticate => createAppAuth');
    const auth = authApp.createAppAuth({
      appId: this._options.appId,
      privateKey: this._options.privateKey,
    });

    console.log('authenticate => auth');
    const appAuth = await auth({type: 'app'});

    console.log('authenticate => getOctokit');
    const octokit = github.getOctokit(appAuth.token);

    console.log('authenticate => installationId');
    const installationId = await this.installationId(octokit);
    console.log('authenticate => auth', installationId);
    const installationAuth = await auth({
      installationId,
      type: 'installation',
      repositoryNames: [...this._options.repositories],
    });
    console.log('authenticate <= auth');
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
    octokit: ReturnType<typeof github.getOctokit>,
  ): Promise<number> {
    if (this._options.installationId !== undefined) {
      return this._options.installationId;
    }

    console.log('installationId => listInstallations');
    const installations = await octokit.rest.apps.listInstallations();
    return installationId(installations, this._options.owner);
  }

  private async userInformation(
    octokit: ReturnType<typeof github.getOctokit>,
    token: string,
  ): Promise<UserInformation | undefined> {
    const app = await octokit.rest.apps.getAuthenticated();
    if (app.data.slug === undefined) {
      return undefined;
    }

    const username = `${app.data.slug}[bot]`;
    console.log('user info => getOctokit');
    const user = await github
      .getOctokit(token)
      .rest.users.getByUsername({username});
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
export {authenticate, type InstallationAuthentication};
