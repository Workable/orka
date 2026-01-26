import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import Joi from '../../src/initializers/joi';
import { isExpiredUrl, isOwnS3Path } from '../../src/initializers/joi';

describe('joi extensions', function () {
  describe('string', function () {
    it('validates and strips null byte', function () {
      assert.strictEqual(
        Joi.string()
          .validate(`asd ${String.fromCharCode(0, 0)}`)
          .value,
        'asd '
      );
    });
    describe('defaultIfEmpty', function () {
      it('with empty string', function () {
        assert.strictEqual(Joi.string().defaultIfEmpty('-').validate('').value, '-');
      });
      it('with string with spaces', function () {
        assert.strictEqual(Joi.string().trim().defaultIfEmpty('-').validate('  ').value, '-');
      });
      it('with null', function () {
        assert.strictEqual(Joi.string().defaultIfEmpty('-').validate(null).value, '-');
      });
    });
  });

  describe('phone', function () {
    it('valid phone', function () {
      const result = Joi.phone().validate('(+30) 6999999999');
      assert.strictEqual(result.value, '(+30) 6999999999');
      assert.strictEqual(result.error, undefined);
    });
    it('invalid phone', function () {
      const result = Joi.phone().validate('abc');
      assert.strictEqual(result.value, 'abc');
      assert.strictEqual(result.error.message, 'The provided phone is invalid');
    });
    it('valid phone with strip', function () {
      const result = Joi.phone().stripIfInvalid().validate('(+30) 6999999999');
      assert.strictEqual(result.value, '(+30) 6999999999');
      assert.strictEqual(result.error, undefined);
    });
    it('invalid phone with strip', function () {
      const result = Joi.phone().stripIfInvalid().validate('abc');
      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.error, undefined);
    });
  });

  describe('stringWithEmpty', function () {
    it('validates and strips null byte', function () {
      assert.strictEqual(
        Joi.stringWithEmpty()
          .validate(`asd ${String.fromCharCode(0, 0)}asd`)
          .value,
        'asd asd'
      );
    });
    it('allows empty or null values', function () {
      const result1 = Joi.stringWithEmpty().validate('');
      assert.strictEqual(result1.error, undefined);
      assert.strictEqual(result1.value, '');

      const result2 = Joi.stringWithEmpty().validate(null);
      assert.strictEqual(result2.error, undefined);
      assert.strictEqual(result2.value, null);

      const result3 = Joi.stringWithEmpty().validate(undefined);
      assert.strictEqual(result3.error, undefined);
      assert.strictEqual(result3.value, undefined);
    });
    describe('defaultIfEmpty', function () {
      it('with empty string', function () {
        assert.strictEqual(Joi.stringWithEmpty().defaultIfEmpty('-').validate('').value, '-');
      });
      it('with empty spaces string', function () {
        assert.strictEqual(Joi.stringWithEmpty().trim().defaultIfEmpty('-').validate('  ').value, '-');
      });
      it('with null', function () {
        assert.strictEqual(Joi.stringWithEmpty().defaultIfEmpty('-').validate(null).value, '-');
      });
    });
  });

  describe('urlInOwnS3', function () {
    it('empty bucket name', function () {
      assert.throws(() => Joi.urlInOwnS3().bucket('').validate('https://foo.s3.amazonaws.com'));
    });
    it('url not in s3', function () {
      assert.strictEqual(
        Joi.urlInOwnS3()
          .bucket('application-form')
          .validate('https://foo.s3.amazonaws.com')
          .error.message,
        'Invalid path provided'
      );
    });
    it('url in s3 1', function () {
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .validate('https://application-form.s3.amazonaws.com');
      assert.strictEqual(underTest.error, undefined);
      assert.strictEqual(underTest.value, 'https://application-form.s3.amazonaws.com');
    });
    it('url in s3 2', function () {
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .validate('https://s3.us-east.amazonaws.com/application-form/a/path?asd=foo');
      assert.strictEqual(underTest.error, undefined);
      assert.strictEqual(underTest.value, 'https://s3.us-east.amazonaws.com/application-form/a/path?asd=foo');
    });
    it('expired tmp url', function () {
      const expiredTimestamp = Math.round(Date.now() / 1000) - 100;
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .errorOnExpiredUrl()
        .validate(`https://application-form.s3.amazonaws.com/tmp/123-456-789?Expires=${expiredTimestamp}`);
      assert.strictEqual(underTest.error.message, 'Your url is expired');
    });
    it('expired tmp url with no rule should succeed', function () {
      const expiredTimestamp = Math.round(Date.now() / 1000) - 100;
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .validate(`https://application-form.s3.amazonaws.com/tmp/123-456-789?Expires=${expiredTimestamp}`);
      assert.strictEqual(underTest.error, undefined);
    });
    it('not expired tmp url should succeed', function () {
      const futureTimestamp = Math.round(Date.now() / 1000) + 100000;
      const url = `https://application-form.s3.amazonaws.com/tmp/123-456-789?Expires=${futureTimestamp}`;
      const underTest = Joi.urlInOwnS3().bucket('application-form').errorOnExpiredUrl().validate(url);
      assert.strictEqual(underTest.error, undefined);
      assert.strictEqual(underTest.value, url);
    });
    it('s3 url with @ after domain should throw error', function () {
      const urls = [
        'https://application-form.s3.amazonaws.com@malicious-url.com/tmp/123-456-789',
        'https://application-form.s3.amazonaws.com@google.com/tmp/123-456-789',
        'https://application-form.s3.amazonaws.com@joecup/tmp/123-456-789',
        'https://application-form.s3.amazonaws.com@hello',
        'https://application-form.s3.amazonaws.com@4nsex02yymx4wzjzc0ljcmsar1xsli97.oastify.com'
      ];
      urls.forEach(url => {
        const underTest = Joi.urlInOwnS3().bucket('application-form').validate(url);
        assert.strictEqual(underTest.error.message, 'Invalid path provided');
      });
    });
    it('s3 url with malicious domain should throw error', function () {
      const urls = [
        'https://workable-application-form.s3.amazonaws.com.ngrok.app/tmp/123-456-789',
        'https://workable-application-form.s3.amazonaws.com.malicious.io/tmp/123-456-789',
        'https://workable-application-form.s3.amazonaws.comattackerdomain.ly/tmp/123-456-789',
        'https://s3.maliciousurl.maliciousamazonaws.com./workable-application-form/tmp/123-456-789'
      ];

      urls.forEach(url => {
        const underTest = Joi.urlInOwnS3().bucket('workable-application-form').validate(url);
        assert.strictEqual(underTest.error.message, 'Invalid path provided');
      });
    });
  });

  describe('url', function () {
    it('rejects URLs with less than two domain fragments', function () {
      assert.strictEqual(Joi.url().validate('https://foo').error.message, '"value" must contain a valid domain name');
    });

    it('accepts URLs with two or more domain fragments', function () {
      assert.strictEqual(Joi.url().validate('https://foo.com/').error, undefined);
    });
  });

  describe('urlWithEmpty', function () {
    it('accepts undefined', function () {
      assert.strictEqual(Joi.urlWithEmpty().validate(undefined).error, undefined);
    });

    it('accepts null', function () {
      assert.strictEqual(Joi.urlWithEmpty().validate(null).error, undefined);
    });

    it('accepts ""', function () {
      assert.strictEqual(Joi.urlWithEmpty().validate('').error, undefined);
    });

    it('rejects URLs with less than two domain fragments', function () {
      assert.strictEqual(Joi.urlWithEmpty().validate('https://foo').error.message, '"value" must contain a valid domain name');
    });

    it('accepts URLs with two or more domain fragments', function () {
      assert.strictEqual(Joi.urlWithEmpty().validate('https://foo.com/').value, 'https://foo.com/');
    });
  });

  describe('safeHtml', function () {
    it('valid html', function () {
      assert.strictEqual(Joi.safeHtml().validate('<p>banana</p>').value, '<p>banana</p>');
      assert.strictEqual(Joi.safeHtml().validate('<b>banana</b>').value, '<b>banana</b>');

      assert.strictEqual(
        Joi.safeHtml()
          .validate('<a href="https://banana.com" target="_blank" rel="nofollow">banana</a>')
          .value,
        '<a href="https://banana.com" target="_blank" rel="nofollow">banana</a>'
      );

      assert.strictEqual(Joi.safeHtml().validate('<a href="/j/ABCDEFG">banana</a>').value, '<a href="/j/ABCDEFG">banana</a>');
    });
    it('invalid tags', function () {
      assert.strictEqual(
        Joi.safeHtml()
          .validate('<script src="javascript:alert(1);">asd</script><p>foo</p>')
          .value,
        '<p>foo</p>'
      );
      assert.strictEqual(Joi.safeHtml().validate('<img src="https://www.google.com" />').value, '');
    });
    it('invalid attributes', function () {
      assert.strictEqual(
        Joi.safeHtml()
          .validate('<a href="https://workable.com" name="invalid">asd</a>')
          .value,
        '<a href="https://workable.com">asd</a>'
      );
    });
    it('required', function () {
      assert.strictEqual(Joi.safeHtml().allow('', null).validate('').error, undefined);
      assert.strictEqual(Joi.safeHtml().validate('').error.message, '"value" is not allowed to be empty');
    });
    it('specify tags', function () {
      assert.strictEqual(
        Joi.safeHtml()
          .allowedTags(['a'])
          .allowedAttributes({
            a: ['href', 'class']
          })
          .validate(
            '<script src="javascript:alert(1);">asd</script><a href="http://google.com" ' +
              'class="aclass" target="_blank"></a><p>foo</p>'
          )
          .value,
        '<a href="http://google.com" class="aclass"></a>foo'
      );
    });
    it('no html at all', function () {
      assert.strictEqual(Joi.safeHtml().allowedAttributes({}).allowedTags([]).validate('<p>banana</p>').value, 'banana');
    });
    it('allow any attribute', function () {
      assert.strictEqual(
        Joi.safeHtml()
          .allowedAttributes(false)
          .validate('<p class="asd" rel="asd">banana</p>')
          .value,
        '<p class="asd" rel="asd">banana</p>'
      );
    });
    it('allows specific schemes', function () {
      const maliciousHtml = `<img src="mailto:kyriakos@workable.com" />`;
      const validHtml = `<img src="https://b9l2ufm1z1g67ow38b65qit9p0vrjj78.oastify.com" />`;
      const schema = Joi.safeHtml()
        .allowedTags(['img', 'svg'])
        .allowedAttributes({ img: ['src'] })
        .allowedSchemes(['https'])
        .allowedSchemesAppliedToAttributes(['src']);

      assert.strictEqual(schema.validate(maliciousHtml).value, '<img />');
      assert.strictEqual(schema.validate(validHtml).value, validHtml);
    });
  });

  describe('objectid', function () {
    it('rejects if invalid objectid', function () {
      assert.strictEqual(Joi.objectId().validate('123').error.message, 'Invalid objectId');
    });
    it('accepts if valid objectid', function () {
      assert.strictEqual(Joi.objectId().validate('627b825fb99b51cc16df1b41').error, undefined);
      assert.strictEqual(Joi.objectId().validate('627b825fb99b51cc16df1b41').value, '627b825fb99b51cc16df1b41');
    });
  });

  describe('isExpiredUrl', function () {
    afterEach(() => {
      mock.restoreAll();
    });

    it('returns true if expired', function () {
      const expirationDate = new Date('2023-01-08T10:00:00Z');
      mock.timers.enable({ apis: ['Date'], now: new Date('2023-01-10T10:00:00Z') });
      const isExpired = [
        isExpiredUrl(`https://bucket.s3.amazonaws.com?Expires=${expirationDate.getTime() / 1000}`),
        isExpiredUrl('https://bucket.s3.amazonaws.com?X-Amz-Date=20230101T100000Z&X-Amz-Expires=604800')
      ];
      isExpired.forEach(x => assert.strictEqual(x, true));
      mock.timers.reset();
    });

    it('returns false if not expired', function () {
      const expirationDate = new Date('2023-01-08T10:00:00Z');
      mock.timers.enable({ apis: ['Date'], now: new Date('2023-01-05T10:00:00Z') });
      const isExpired = [
        isExpiredUrl(`https://bucket.s3.amazonaws.com?Expires=${expirationDate.getTime() / 1000}`),
        isExpiredUrl('https://bucket.s3.amazonaws.com?X-Amz-Date=20230101T100000Z&X-Amz-Expires=604800')
      ];
      isExpired.forEach(x => assert.strictEqual(x, false));
      mock.timers.reset();
    });
  });

  describe('isOwnS3Path', function () {
    it('should return true for valid s3 path', function () {
      const isOwnPath = [
        isOwnS3Path('some-bucket', 'https://s3.amazonaws.com/some-bucket/some-file-name'),
        isOwnS3Path('some-bucket', 'https://some-bucket.s3.some-region-1.amazonaws.com/'),
        isOwnS3Path('some-bucket', 'https://some-bucket.s3.amazonaws.com/')
      ];
      isOwnPath.forEach(x => assert.strictEqual(x, true));
    });

    it('should return false for invalid s3 path', function () {
      const isOwnPath = [
        isOwnS3Path('some-bucket', 'https://s3.amazonaws.com/some-other-bucket/some-file-name'),
        isOwnS3Path('some-bucket', 'https://some-other-bucket.s3.some-region-1.amazonaws.com/'),
        isOwnS3Path('some-bucket', 'https://some-other-bucket.s3.amazonaws.com/'),
        isOwnS3Path('some-bucket', 'https://some-other-bucket.s3.some.deep.nested.subdomain.amazonaws.com/'),
        isOwnS3Path('some-bucket', 'https://some-bucket.s3.some.deep.nested.subdomain.amazonaws.com/')
      ];
      isOwnPath.forEach(x => assert.strictEqual(x, false));
    });
  });
});
