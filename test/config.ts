import {env} from 'node:process';
import {fileURLToPath} from 'node:url';
import {z} from 'zod';
import dotenv from 'dotenv';

const appSchema = z.object({
  id: z.number().int().positive(),
  privateKey: z
    .string()
    .min(1)
    .default(
      [
        '-----BEGIN RSA PRIVATE KEY-----',
        'MIIEpQIBAAKCAQEA0ZcPtphS9Ny197AtREtnHamays08zx0Rno4FEktxiTdyz6IG',
        'JmxFs0srEWCobHp+/R0sqJWJNx9Zi39/NL/Sk8xOo/6qqO1yaPniD7uhzGsWLsrI',
        'EjL22aYT7bryREZs2ULcSag3bethok9HGlRamdXXwqoS1xAeYxxA9/3f3ixI7lDU',
        'cIJ5b5h4UNEIEKfFB0yeoUrLu8vQuif8Vk0wasBsNdlGYXGUHxwYkQVJgvFOLDAq',
        'p11e4YsDcsX6DPrkqIIMeYNGvClNSP5xCUZuDh3wnBgQ4Kt6791VZDs4uy1T+5Ha',
        'TbdSk25eSWXsV1Lj/tglq9pSh2mP2LORPWv7+QIDAQABAoIBAQCsQZJpiQHNO8TW',
        'oFZj5fEG4QlWmp3av1Jm1OR4J8dVdlwHKGwTkjMq66Gm86EZHwhVsW+t0tDmm/51',
        'd0EuMmW4kVck076hfh3lB1LziUuufWjK5mDPDFHzidqhLV/GG3eEjL4OT5HW5njk',
        '9HFEw4V/H9Dnre40EYxX+rWu3Fns90yx/uTRgGawM67ytYiA0mnX+MeWoHPTqRys',
        'IoRJxb2AfopnQob6KDu/9hCcm74vxylfb5LdmPIAR6raQ/5u1/wd2vwGcXWxonkf',
        'YbP+txrPiuB1fCdlN/rzqLv0Zftb4MzLJrcRPksVE3FjMZ6rc1oZKQ99ptW+nkd6',
        'BELYf1f9AoGBAPr+1DgkKOj5sEh4WsdLWz1gMp+IttTlYxMg9SXLPiANpgvSEeed',
        'ALhH7g1oZyHDi38ONW1No9PAJ99rHa+AuwpbOhw7Hw5f1MBNrsGu7yY4oCuMxgIp',
        '1IjStQaVO0/cugIp8IbTC4SoMdaAWounvQFMHMqLjX5O5lJAhgHxZmBTAoGBANXE',
        '4nbCPfMbVzO6Cq6Rc3ieKJgq3w5n9/lgwhmDdX/rlkSpspIgqcTquDDCdZ6fRtC5',
        'uCunEp4aPtG4pJECRNkeg1NC8T6a+xqsPWKJQpWcROIts8fEdZkelHz2X0QlqTB7',
        'o99fjf9+W1mgvGV1FUvED0+hacCs0rKLj38f1FkDAoGABlG4Ihm29fajW4+8KVxa',
        'VbdATwfwIngMAIVJ5sOxMrllPtLxJHWtePZGpgvE3PLBZleDPNdBkqk518QooSyK',
        'iP42/lL2uzPqdVT/W1z+JGY0kiQfMBrBgRhc+mdzcNVL0ZYguiRCG/roFlBw9ycn',
        '+Qpjhy3wSAfQgK2jMhVT0IUCgYEAh8yAVRNGSYbn2atpF8a8xTYr8abidoNjy19F',
        'TvHtFetyVYI8N4pabwbxJcCS+caTNQuWTNzg/eEMYSxcFuaLGCbDJISVPsEznZkn',
        'kc5Cp0pTlB+WYuSSFEiR6eSVVnRaS7tvufo4+cKqg4CRzh4X/j65v0t6I/VmEBiK',
        'eyacPkMCgYEA8mZ5qCxhZyCCDiBsBwWh32C0iVOF1TjDbDE2H+C/3YsYPC+07WKH',
        'aKgAmVpWUFlorWWuaoQlRKvBr2G+TjBuOJNbnvSTZ0e0FJfyPCzEEu+iHFreVmB7',
        'M+DeyJn2047IJXvKMh7CAt7gXtW8ByCAUo3e5pMYrnGn0If5ukO/aqE=',
        '-----END RSA PRIVATE KEY-----',
      ].join('\n'),
    ),
  owner: z.string().min(1).default('vidavidorra'),
  installationId: z.number().int().positive().default(1),
});

const schema = z.object({
  /**
   * Path for test fictures as they would be seen from the compiled sources'
   * perspective.
   */
  fixturesPath: z
    .string()
    .min(1)
    .default(fileURLToPath(new URL('../../test/fixtures', import.meta.url))),
  app: z.object({
    withOneInstallation: appSchema,
    withoutInstallation: appSchema,
    withTwoInstallations: appSchema,
  }),
  repository: z.string().min(1).default('.github'),
  nockBackMode: z
    .enum(['wild', 'dryrun', 'record', 'update', 'lockdown'])
    .default('lockdown'),
});

dotenv.config();

const config = schema.parse({
  app: {
    withOneInstallation: {
      id: 214_511,
      privateKey: env.GAAT_APP_WITH_ONE_INSTALLATION_PRIVATE_KEY,
      installationId: 26_853_572,
    },
    withoutInstallation: {
      id: 213_406,
      privateKey: env.GAAT_APP_WITHOUT_INSTALLATION_PRIVATE_KEY,
    },
    withTwoInstallations: {
      id: 213_643,
      privateKey: env.GAAT_APP_WITH_TWO_INSTALLATIONS_PRIVATE_KEY,
      installationId: 26_772_308,
    },
  },
  nockBackMode: env.GAAT_NOCK_BACK_MODE,
});

export default config;
