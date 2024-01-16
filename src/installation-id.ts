import {type Endpoints} from '@octokit/types';

function installationId(
  installations: Endpoints['GET /app/installations']['response'],
  owner?: string,
): number {
  if (installations.data.length === 0) {
    throw new Error('The GitHub App must have at least one installation');
  }

  if (owner === undefined && installations.data.length > 1) {
    throw new Error(
      'Without "owner", the GitHub App must have exactly one installation',
    );
  }

  if (owner === undefined) {
    return installations.data[0].id;
  }

  const installation = installations.data.find(
    ({account}) => account?.login === owner || account?.slug === owner,
  );
  if (installation === undefined) {
    throw new Error('The "owner" must have the GitHub App installed');
  }

  return installation.id;
}

export {installationId};
