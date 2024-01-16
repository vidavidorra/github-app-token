import {z} from 'zod';

const rsaPrivateKeyStart = '-----BEGIN RSA PRIVATE KEY-----';
const rsaPrivateKeyEnd = '-----END RSA PRIVATE KEY-----';

/**
 * Convert a string argument to a number if there is a valid conversion.
 *
 * 1. Remove trailing and leading whitespace.
 * 2. Convert integer string to a `number`.
 * 3. Convert empty string to `undefined`.
 * 4. Return raw argument if no conversion could be made.
 */
function stringArgToNumber(arg: unknown): number | unknown {
  const isString = typeof arg === 'string';
  if (isString && /^[ \t]*[1-9]\d*[ \t]*$/.test(arg)) {
    return Number.parseInt(arg, 10);
  }

  return isString && arg.length === 0 ? undefined : arg;
}

const options = z.object({
  appId: z.preprocess(stringArgToNumber, z.number().int().positive()),
  privateKey: z
    .string()
    .min(rsaPrivateKeyStart.length + rsaPrivateKeyEnd.length + 1)
    .superRefine((value, context) => {
      if (!value.startsWith(`${rsaPrivateKeyStart}`)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `String must start with "${rsaPrivateKeyStart}"`,
        });
      }

      if (!new RegExp(`${rsaPrivateKeyEnd}(\r|\n|\r\n)*$`).test(value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `String must end with "${rsaPrivateKeyEnd}"`,
        });
      }
    }),
  /**
   * Repositories with regular expression as used by [GitHub Desktop](
   * https://github.com/desktop/desktop/blob/release-3.0.2/app/src/ui/add-repository/sanitized-repository-name.ts#L9-L11).
   * This especially makes sure the repositories don't include an owner, which
   * is relevant for these options as `owner` is specified separately.
   */
  repositories: z.preprocess(
    (arg) => (Array.isArray(arg) ? new Set(arg) : arg),
    z.set(z.string().regex(/^[\w.-]+$/)).min(1),
  ),
  owner: z.string().min(1).optional(),
  installationId: z
    .preprocess(stringArgToNumber, z.number().int().positive().optional())
    .optional(),
  includeUserInformation: z.boolean().default(false),
});

type Options = z.infer<typeof options>;

type InputOptions = z.input<typeof options>;
type AllowString<T, K extends keyof T> = Omit<T, K> & {[P in K]: T[K] | string};
type Input = AllowString<InputOptions, 'appId' | 'installationId'>;

export {options, type Options, type Input};
