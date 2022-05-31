import * as _Joi from 'joi';
import * as objectid from 'objectid';
import { isString } from 'lodash';
import * as sanitizeHtml from 'sanitize-html';

export const isValidPhone = (val: string): boolean => /^[\d\s\(\)\-\+–\.]+$/.test(val);
export const clearNullByte = (val: string): string => (val && isString(val) ? val.replace(/\u0000/g, '') : val);
export const isValidHexColor = (val: string): boolean => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val);
export const isOwnS3Path = (bucket: string, val: string): boolean =>
  val?.startsWith(`https://${bucket}.s3.amazonaws.com`) ||
  new RegExp(`^https:\\/\\/s3\\..+\\.amazonaws\\.com\\/${bucket}\\/.*`, 'g').test(val);

interface JoiWithExtensions extends _Joi.Root {
  booleanWithEmpty(): _Joi.BooleanSchema;
  dateInThePast(): _Joi.DateSchema;
  hexColor(): _Joi.StringSchema;
  objectId(): _Joi.StringSchema;
  phone(): _Joi.StringSchema & { stripIfInvalid: () => _Joi.StringSchema };
  safeHtml(): _Joi.StringSchema & { allowEmpty: () => _Joi.StringSchema };
  stringWithEmpty(): _Joi.StringSchema & { defaultIfEmpty: (v: string) => _Joi.StringSchema };
  string(): _Joi.StringSchema & { defaultIfEmpty: (v: string) => _Joi.StringSchema };
  urlInOwnS3(): _Joi.StringSchema & { bucket: (name: string) => _Joi.StringSchema };
  url(): _Joi.StringSchema;
  urlWithEmpty(): _Joi.StringSchema;
}

const Joi: JoiWithExtensions = _Joi.extend(
  joi => ({
    type: 'objectId',
    base: joi.string(),
    messages: { 'objectId.invalid': 'Invalid objectId' },
    validate: (value, helpers) => {
      return objectid.isValid(value)
        ? { value }
        : {
          value,
          errors: helpers.error('objectId.invalid'),
        };
    },
  }),
  joi => ({
    type: 'string',
    base: joi.string(),
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
        value: newVal,
      };
    },
    rules: {
      defaultIfEmpty: {
        convert: true,
        method(v) {
          return this.$_addRule({ name: 'defaultIfEmpty', args: { v } });
        },
        args: [
          {
            name: 'v',
            ref: true,
            assert: value => typeof value === 'string' && value?.trim()?.length !== 0,
            message: 'must be a non empty string',
          },
        ],
      },
    },
  }),
  joi => ({
    type: 'url',
    base: joi.string().uri({ domain: { minDomainSegments: 2 } }),
  }),
  joi => ({
    type: 'urlWithEmpty',
    base: joi
      .string()
      .uri({ domain: { minDomainSegments: 2 } })
      .allow('')
      .allow(null),
  }),
  joi => ({
    type: 'phone',
    base: joi.string(),
    messages: { 'string.phone': 'The provided phone is invalid' },
    rules: {
      stripIfInvalid: {
        method() {
          return this.$_setFlag('stripIfInvalid', true);
        },
      },
    },
    validate: (value, helpers) => {
      // From: https://github.com/Workable/workable/blob/master/app/validators/phone_validator.rb#L3
      return isValidPhone(value)
        ? { value }
        : helpers.schema.$_getFlag('stripIfInvalid')
          ? { value: undefined }
          : {
            value,
            errors: helpers.error('string.phone'),
          };
    },
  }),
  joi => ({
    type: 'hexColor',
    base: joi.string(),
    messages: { 'string.hexcolor': 'The provided color is invalid' },
    validate: (value, helpers) => {
      return isValidHexColor(value)
        ? { value }
        : {
          value,
          errors: helpers.error('string.hexcolor'),
        };
    },
  }),
  joi => ({
    type: 'stringWithEmpty',
    base: joi.string().allow('').allow(null),
  }),
  joi => ({
    type: 'booleanWithEmpty',
    base: joi.boolean().allow(null).empty().falsy(''),
  }),
  joi => ({
    type: 'dateInThePast',
    base: joi.date().iso().max(Date.now()).message('Date must be in the past'),
  }),
  joi => ({
    type: 'urlInOwnS3',
    base: joi.string().uri(),
    messages: {
      'string.notInS3': 'Invalid path provided',
      'string.bucketRuleMissing': 'You need to provide a bucket rule',
    },
    rules: {
      bucket: {
        method(bucket: string) {
          return this.$_addRule({ name: 'bucket', args: { bucket } });
        },
        args: [
          {
            name: 'bucket',
            assert: value => !!(typeof value === 'string' && value),
            message: 'must be a non empty string',
          },
        ],
        validate(value, helpers, { bucket }) {
          if (!isOwnS3Path(bucket, value)) {
            return helpers.error('string.notInS3');
          }
          return value;
        },
      },
    },
    validate(value, helpers) {
      if (!helpers.schema.$_getRule('bucket')) {
        return { errors: helpers.error('string.bucketRuleMissing') };
      }
      return { value };
    },
  }),
  joi => ({
    type: 'safeHtml',
    base: joi.string(),
    rules: {
      allowEmpty: {
        method() {
          // @ts-ignore
          return this.$_root.allow('').allow(null);
        },
      },
    },
    prepare: value => ({
      value: sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'u', 'span', 'p', 'div', 'a', 'font'],
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
          font: ['color'],
        },
      }),
    }),
  })
);

export default Joi;
