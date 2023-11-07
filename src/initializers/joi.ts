import * as _Joi from 'joi';
import {isString} from 'lodash';
import * as sanitizeHtml from 'sanitize-html';
import {URL} from 'url';

export const isValidPhone = (val: string): boolean => /^[\d\s\(\)\-\+–\.]+$/.test(val);
export const clearNullByte = (val: string): string => (val && isString(val) ? val.replace(/\u0000/g, '') : val);
export const isValidHexColor = (val: string): boolean => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val);
export const isOwnS3Path = (bucket: string, val: string): boolean => {
  try {
    const { host, protocol, pathname } = new URL(val);
    const matchingProtocol = protocol === 'https:';
    const s3Host = host === `${bucket}.s3.amazonaws.com`;
    const s3HostBucketInPath =
      host.startsWith('s3.') &&
      host.endsWith('.amazonaws.com') &&
      pathname.startsWith(`/${bucket}/`);
    return matchingProtocol && (s3Host || s3HostBucketInPath);
  } catch (e) {
    return false;
  }
};

export const isExpiredUrl = (val: string): boolean => {
  const parsed = new URL(val);
  if (parsed?.searchParams?.has('Expires')) {
    const expiresAt = Number(parsed.searchParams.get('Expires'));
    // If expiresAt is not a number do not validate
    if (isNaN(expiresAt)) return false;
    return Math.round(Date.now() / 1000) > expiresAt;
  }
  return false;
};

type SafeHtml = _Joi.StringSchema & {
  allowedTags: (tags: string[]) => SafeHtml;
  allowedAttributes: (attributes: { [key: string]: string[] }) => SafeHtml;
};

type UrlInOwnS3 = _Joi.StringSchema & {
  bucket: (name: string) => UrlInOwnS3;
  errorOnExpiredUrl: () => UrlInOwnS3;
};

interface JoiWithExtensions extends _Joi.Root {
  booleanWithEmpty(): _Joi.BooleanSchema;

  dateInThePast(): _Joi.DateSchema;

  hexColor(): _Joi.StringSchema;

  objectId(): _Joi.StringSchema;

  phone(): _Joi.StringSchema & { stripIfInvalid: () => _Joi.StringSchema };

  safeHtml(): SafeHtml;

  stringWithEmpty(): _Joi.StringSchema & { defaultIfEmpty: (v: string) => _Joi.StringSchema };

  string(): _Joi.StringSchema & { defaultIfEmpty: (v: string) => _Joi.StringSchema };

  urlInOwnS3(): UrlInOwnS3;

  url(): _Joi.StringSchema;

  urlWithEmpty(): _Joi.StringSchema;
}

const Joi: JoiWithExtensions = _Joi.extend(
  joi => ({
    type: 'objectId',
    base: joi.string().meta({baseType: 'string'}),
    messages: {'objectId.invalid': 'Invalid objectId'},
    validate: (value, helpers) => {
      return require('mongodb').ObjectId.isValid(value)
        ? {value}
        : {
          value,
          errors: helpers.error('objectId.invalid')
        };
    }
  }),
  joi => ({
    type: 'string',
    base: joi.string().meta({baseType: 'string'}),
    prepare: (val, helpers) => {
      let newVal = val === null || val === undefined ? val : clearNullByte(val);

      const defaultIfEmptyRule = helpers.schema.$_getRule('defaultIfEmpty');
      if (defaultIfEmptyRule?.args?.v) {
        const trimRule = helpers.schema.$_getRule('trim');
        if (trimRule?.args?.enabled) {
          newVal = newVal?.trim();
        }
        if (!newVal) newVal = defaultIfEmptyRule.args.v;
      }

      return {
        value: newVal
      };
    },
    rules: {
      defaultIfEmpty: {
        convert: true,
        method(v) {
          return this.$_addRule({name: 'defaultIfEmpty', args: {v}});
        },
        args: [
          {
            name: 'v',
            ref: true,
            assert: value => typeof value === 'string' && value?.trim()?.length !== 0,
            message: 'must be a non empty string'
          }
        ]
      }
    }
  }),
  joi => ({
    type: 'url',
    base: joi
      .string()
      .uri({domain: {minDomainSegments: 2}})
      .meta({baseType: 'string'})
  }),
  joi => ({
    type: 'urlWithEmpty',
    base: joi
      .string()
      .uri({domain: {minDomainSegments: 2}})
      .allow('')
      .allow(null)
      .meta({baseType: 'string'})
  }),
  joi => ({
    type: 'phone',
    base: joi.string().meta({baseType: 'string'}),
    messages: {'string.phone': 'The provided phone is invalid'},
    rules: {
      stripIfInvalid: {
        method() {
          return this.$_setFlag('stripIfInvalid', true);
        }
      }
    },
    validate: (value, helpers) => {
      // From: https://github.com/Workable/workable/blob/master/app/validators/phone_validator.rb#L3
      return isValidPhone(value)
        ? {value}
        : helpers.schema.$_getFlag('stripIfInvalid')
          ? {value: undefined}
          : {
            value,
            errors: helpers.error('string.phone')
          };
    }
  }),
  joi => ({
    type: 'hexColor',
    base: joi.string().meta({baseType: 'string'}),
    messages: {'string.hexcolor': 'The provided color is invalid'},
    validate: (value, helpers) => {
      return isValidHexColor(value)
        ? {value}
        : {
          value,
          errors: helpers.error('string.hexcolor')
        };
    }
  }),
  joi => ({
    type: 'stringWithEmpty',
    base: joi.string().allow('').allow(null).meta({baseType: 'string'})
  }),
  joi => ({
    type: 'booleanWithEmpty',
    base: joi.boolean().allow(null).empty().falsy('').meta({baseType: 'boolean'})
  }),
  joi => ({
    type: 'dateInThePast',
    base: joi.date().iso().max(Date.now()).message('Date must be in the past').meta({baseType: 'date'})
  }),
  joi => ({
    type: 'urlInOwnS3',
    base: joi.string().uri().meta({baseType: 'string'}),
    messages: {
      'string.notInS3': 'Invalid path provided',
      'string.bucketRuleMissing': 'You need to provide a bucket rule',
      'string.urlExpired': 'Your url is expired'
    },
    rules: {
      bucket: {
        method(bucket: string) {
          return this.$_addRule({name: 'bucket', args: {bucket}});
        },
        args: [
          {
            name: 'bucket',
            assert: value => !!(typeof value === 'string' && value),
            message: 'must be a non empty string'
          }
        ],
        validate(value, helpers, {bucket}) {
          if (!isOwnS3Path(bucket, value)) {
            return helpers.error('string.notInS3');
          }
          return value;
        }
      },
      errorOnExpiredUrl: {
        method() {
          return this.$_addRule({name: 'errorOnExpiredUrl'});
        },
        args: [],
        validate(value, helpers) {
          if (isExpiredUrl(value)) return helpers.error('string.urlExpired');
          return value;
        }
      }
    },
    validate(value, helpers) {
      if (!helpers.schema.$_getRule('bucket')) {
        return {errors: helpers.error('string.bucketRuleMissing')};
      }
      return {value};
    }
  }),
  joi => ({
    type: 'safeHtml',
    base: joi.string().meta({baseType: 'string'}),
    rules: {
      allowedTags: {
        method(allowedTags: string) {
          return this.$_addRule({name: 'allowedTags', args: {allowedTags}});
        },
        args: [
          {
            name: 'allowedTags',
            assert: value => Array.isArray(value) && value.length > 0,
            message: 'must be a non empty array'
          }
        ],
        validate(value) {
          return value;
        }
      },
      allowedAttributes: {
        method(allowedAttributes: string) {
          return this.$_addRule({name: 'allowedAttributes', args: {allowedAttributes}});
        },
        args: [
          {
            name: 'allowedAttributes',
            assert: value => typeof value === 'object' && Object.keys(value).length > 0,
            message: 'must be a non empty object'
          }
        ],
        validate(value) {
          return value;
        }
      }
    },
    prepare: (value, helpers) => {
      const allowedTags = helpers.schema.$_getRule('allowedTags')?.args?.allowedTags || [
        'b',
        'i',
        'u',
        'span',
        'p',
        'div',
        'a',
        'font'
      ];
      const allowedAttributes = helpers.schema.$_getRule('allowedAttributes')?.args?.allowedAttributes || {
        a: ['href', 'target', 'rel'],
        font: ['color']
      };
      return {
        value: sanitizeHtml(value, {allowedTags, allowedAttributes})
      };
    }
  })
);

export default Joi;
