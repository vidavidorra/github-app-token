import test from 'ava';
import {type Input as OptionsInput, options} from './options.js';

type Input = Partial<
  Omit<OptionsInput, 'repositories'> & {
    repositories: OptionsInput['repositories'] | string[];
  }
>;

class Setup {
  private readonly _privateKey = {
    begin: '-----BEGIN RSA PRIVATE KEY-----',
    body: 'd0rHwHoKte+zuEirOkw5xneOSx0LbjyAZhIH2sbolVyuPmbvQh//i1+Yf/M6KUB+Syv+4voN5dFRCwR0ODPw7g==',
    end: '-----END RSA PRIVATE KEY-----',
  };

  private readonly _setKeys: Array<keyof Input> = [];

  private _data: Input = {
    appId: 1,
    privateKey: [
      this._privateKey.begin,
      this._privateKey.body,
      this._privateKey.end,
    ].join('\n'),
    installationId: undefined,
    repositories: new Set(['bluebird']),
    owner: undefined,
    includeUserInformation: undefined,
  };

  get data() {
    return this._data;
  }

  get key() {
    const key = this._setKeys.at(0);
    if (this._setKeys.length !== 1 || key === undefined) {
      throw new Error('key must be used with only a single key set');
    }

    return key;
  }

  appId(appId: Input['appId']) {
    return this.set('appId', appId);
  }

  privateKey(parts: {begin?: string; body?: string; end?: string}) {
    const pk = {...this._privateKey, ...parts};
    return this.set('privateKey', [pk.begin, pk.body, pk.end].join('\n'));
  }

  repositoriesSet(...repositories: string[]) {
    return this.set('repositories', new Set(repositories));
  }

  repositories(...repositories: string[]) {
    return this.set('repositories', repositories);
  }

  owner(owner: Input['owner']) {
    return this.set('owner', owner);
  }

  installationId(installationId: Input['installationId']) {
    return this.set('installationId', installationId);
  }

  includeUserInformation(
    includeUserInformation: Input['includeUserInformation'],
  ) {
    return this.set('includeUserInformation', includeUserInformation);
  }

  set<T extends keyof Input>(key: T, value: Input[T] | false): this {
    if (value !== false) {
      this._data[key] = value;
    }

    this._setKeys.push(key);
    return this;
  }
}

function setup(): Setup {
  return new Setup();
}

function title(status: 'succeeds' | 'fails', prefix: string, setup: Setup) {
  let suffix = '';
  if (
    (setup.key === 'appId' && typeof setup.data.appId === 'string') ||
    (setup.key === 'installationId' &&
      typeof setup.data.installationId === 'string')
  ) {
    suffix = 'as string';
  } else if (
    setup.key === 'repositories' &&
    Array.isArray(setup.data.repositories)
  ) {
    suffix = 'as array';
  }

  return [status, 'parsing with', prefix, `"${setup.key}"`, suffix].join(' ');
}

const succeedsParsing = test.macro<[Setup, string]>({
  exec(t, setup) {
    t.true(options.safeParse(setup.data).success);
  },
  title(_, setup, prefix) {
    return title('succeeds', prefix, setup);
  },
});

const failsParsingRegex = test.macro<[Setup, string, RegExp]>({
  exec(t, setup, _, message) {
    const parsed = options.safeParse(setup.data);

    t.false(parsed.success);
    if (!parsed.success) {
      t.is(parsed.error.errors.length, 1);
      t.is(parsed.error.errors.at(0)?.path.at(0), setup.key);
      t.regex(parsed.error.errors.at(0)?.message ?? '', message);
    }
  },
  title: (_, setup, prefix) => title('fails', prefix, setup),
});

const failsParsing = test.macro<[Setup, string]>({
  exec: (t, setup, prefix) => failsParsingRegex.exec(t, setup, prefix, /.*/),
  title: (_, setup, prefix) => title('fails', prefix, setup),
});

const maxInt = Number.MAX_SAFE_INTEGER;
test(succeedsParsing, setup().appId(1), 'positive');
test(succeedsParsing, setup().appId('1'), 'positive');
test(succeedsParsing, setup().appId(' 1'), 'space prefix positive');
test(succeedsParsing, setup().appId('\t1'), 'tab prefix positive');
test(succeedsParsing, setup().appId('\t 1'), 'mixed prefix positive');
test(succeedsParsing, setup().appId('1 '), 'space suffix positive');
test(succeedsParsing, setup().appId('1\t'), 'tab suffix positive');
test(succeedsParsing, setup().appId('1\t '), 'mixed suffix positive');
test(succeedsParsing, setup().appId(' \t1 \t'), 'untrimmed positive');
test(succeedsParsing, setup().appId(maxInt), 'maximum integer');
test(succeedsParsing, setup().appId(maxInt.toString()), 'maximum integer');
test(failsParsing, setup().appId(0), 'zero');
test(failsParsing, setup().appId('0'), 'zero');
test(failsParsing, setup().appId(-1), 'negative');
test(failsParsing, setup().appId('-1'), 'negative');
test(failsParsing, setup().appId('abc'), 'non-numeric');
test(failsParsing, setup().appId(undefined), 'undefined');
test(failsParsing, setup().appId(''), 'empty string');

test(succeedsParsing, setup().set('privateKey', false), 'normal RSA');
test(failsParsing, setup().set('privateKey', undefined), 'undefined');
test(
  failsParsingRegex,
  setup().privateKey({begin: '-----BEGIN EC PRIVATE KEY-----'}),
  'no RSA begin in',
  /^String must start with/,
);
test(
  failsParsingRegex,
  setup().privateKey({end: '-----END EC PRIVATE KEY-----'}),
  'no RSA end in',
  /^String must end with/,
);

test(succeedsParsing, setup().repositoriesSet('bluebird'), 'a single');
test(succeedsParsing, setup().repositories('bluebird'), 'a single');
const repositories = ['bluebird', 'bee-eater'] as const;
test(succeedsParsing, setup().repositoriesSet(...repositories), 'multiple');
test(succeedsParsing, setup().repositories(...repositories), 'multiple');
test(failsParsing, setup().repositoriesSet(''), 'empty value');
test(failsParsing, setup().repositories(''), 'empty value');
test(failsParsing, setup().repositoriesSet(), 'empty');
test(failsParsing, setup().repositories(), 'empty');
test(failsParsing, setup().repositoriesSet('amoore/bluebird'), 'an owner in');
test(failsParsing, setup().repositories('amoore/bluebird'), 'an owner in');
test(failsParsing, setup().set('repositories', undefined), 'undefined');

test(succeedsParsing, setup().owner(undefined), 'undefined');
test(succeedsParsing, setup().owner('amoore'), 'normal');
test(failsParsing, setup().owner(''), 'empty');

test(succeedsParsing, setup().installationId(undefined), 'undefined');
test(succeedsParsing, setup().installationId(''), 'empty string');
test(succeedsParsing, setup().installationId(1), 'positive');
test(succeedsParsing, setup().installationId('1'), 'positive');
test(succeedsParsing, setup().installationId(' 1'), 'space prefix positive');
test(succeedsParsing, setup().installationId('\t1'), 'tab prefix positive');
test(succeedsParsing, setup().installationId('\t 1'), 'mixed prefix positive');
test(succeedsParsing, setup().installationId('1 '), 'space suffix positive');
test(succeedsParsing, setup().installationId('1\t'), 'tab suffix positive');
test(succeedsParsing, setup().installationId('1\t '), 'mixed suffix positive');
test(succeedsParsing, setup().installationId(' \t1 \t'), 'untrimmed positive');
test(succeedsParsing, setup().installationId(maxInt), 'maximum integer');
test(
  succeedsParsing,
  setup().installationId(maxInt.toString()),
  'maximum integer',
);
test(failsParsing, setup().installationId(0), 'zero');
test(failsParsing, setup().installationId('0'), 'zero');
test(failsParsing, setup().installationId(-1), 'negative');
test(failsParsing, setup().installationId('-1'), 'negative');
test(failsParsing, setup().installationId('abc'), 'non-numeric');

test(succeedsParsing, setup().includeUserInformation(undefined), 'undefined');
test(succeedsParsing, setup().includeUserInformation(true), 'true');
test(succeedsParsing, setup().includeUserInformation(false), 'false');
test('defaults "includeUserInformation" to "false"', (t) => {
  const parsed = options.safeParse(
    setup().includeUserInformation(undefined).data,
  );
  t.true(parsed.success);
  if (parsed.success) {
    t.false(parsed.data.includeUserInformation);
  }
});
