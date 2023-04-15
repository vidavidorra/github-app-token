# GitHub App token <!-- omit in toc -->

Authenticate as a [GitHub App][github-app], from a [GitHub Action][github-action] or TypeScript/JavaScript code.

- Authenticate as a [GitHub App][github-app].
- Fine control over permissions.
- No need for dedicated user for personal access token permission control.
- Use [GitHub Actions][github-action] to authenticate as a [GitHub App][github-app].
- Authenticate as a [GitHub App][github-app] from TypeScript or JavaScript code.

---

[![Node.js version support](https://img.shields.io/node/v/github-app-token?logo=node.js&style=flat-square)](https://nodejs.org/en/about/releases/)
[![Renovate enabled](https://img.shields.io/badge/Renovate-enabled-brightgreen?logo=renovatebot&logoColor&style=flat-square)](https://renovatebot.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Code coverage](https://img.shields.io/codecov/c/github/vidavidorra/github-app-token?logo=codecov&style=flat-square)](https://codecov.io/gh/vidavidorra/github-app-token)
[![License](https://img.shields.io/github/license/vidavidorra/github-app-token?style=flat-square)](LICENSE.md)

- [Install](#install)
- [Usage](#usage)
  - [GitHub Action](#github-action)
  - [API](#api)
- [Contributing](#contributing)
- [Security policy](#security-policy)
- [License](#license)

## Install

GitHub App token can be used either as a [GitHub Action][github-action], please see the [GitHub Action](#github-action) usage instructions for that, or as a npm package. The following command can be used to install the npm package as a dependency. For the API of the npm packge, please see the [API](#api) usage instructions.

```shell
$ npm install @vidavidorra/github-app-token
```

or

## Usage

### GitHub Action

```yml
jobs:
  my_first_job:
    runs-on: ubuntu-latest
    permissions: {}
    steps:
      - name: GitHub App token
        id: app-token
        uses: vidavidorra/github-app-token@1c002dd
        with:
          appId: ${{ secrets.APP_ID }}
          privateKey: ${{ secrets.PRIVATE_KEY }}
      - name: Use the token
        run: # Some command using ${{ steps.app-token.outputs.token }}
```

<a name="inputs"></a>

#### Inputs <!-- omit in toc -->

| name                     | type    | required | description                                               |
| ------------------------ | ------- | -------- | --------------------------------------------------------- |
| `appId`                  | integer | ✓        | ID of the GitHub App                                      |
| `privateKey`             | string  | ✓        | private key of the GitHub App in PEM format               |
| `repositories`           | string  |          | repositories to authenticate for                          |
| `owner`                  | string  |          | owner of the repositories to authenticate for             |
| `installationId`         | integer |          | installation ID of the GitHub App installation            |
| `includeUserInformation` | boolean |          | whether or not to include user information in the outputs |

#### Outputs <!-- omit in toc -->

| name         | type     | description                                      |
| ------------ | -------- | ------------------------------------------------ |
| `token`      | string   | GitHub App installation access token             |
| `createdAt`  | string   | creation date of the token                       |
| `expiresAt`  | string   | expiration date of the token                     |
| _`email`_    | _string_ | _email of the GitHub app user (**optional**)_    |
| _`username`_ | _string_ | _username of the GitHub app user (**optional**)_ |

### API

The `authenticate` function is exported, with the same [Inputs](#inputs) as the [GitHub Action](#github-action).

## Contributing

Please [create an issue](https://github.com/vidavidorra/github-app-token/issues/new/choose) if you have a bug report, feature proposal or question that does not yet exist.

Please give this project a star ⭐ if you like it and consider becoming a [sponsor](https://github.com/sponsors/jdbruijn) to support this project.

Refer to the [contributing guide](https://github.com/vidavidorra/.github/blob/main/CONTRIBUTING.md) detailed information about other contributions, like pull requests.

[![Conventional Commits: 1.0.0](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow?style=flat-square)](https://conventionalcommits.org)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg?style=flat-square)](https://github.com/xojs/xo)
[![Code style](https://img.shields.io/badge/code_style-Prettier-ff69b4?logo=prettier&style=flat-square)](https://github.com/prettier/prettier)
[![Linting](https://img.shields.io/badge/linting-ESLint-lightgrey?logo=eslint&style=flat-square)](https://eslint.org)

## Security policy

Please refer to the [Security Policy on GitHub](https://github.com/vidavidorra/github-app-token/security/) for the security policy.

## License

This project is licensed under the [GPLv3 license](https://www.gnu.org/licenses/gpl.html).

Copyright © 2022-2023 Jeroen de Bruijn

<details><summary>License details.</summary>
<p>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

The full text of the license is available in the [LICENSE](LICENSE.md) file in this repository and [online](https://www.gnu.org/licenses/gpl.html).

</details>

<!-- References -->

[github-action]: https://github.com/features/actions/
[github-app]: https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps
