import should = require('should');
import Joi from '../../src/initializers/joi';

describe('joi extensions', function () {
  describe('string', function () {
    it('validates and strips null byte', function () {
      Joi.string().validate(`asd ${String.fromCharCode(0, 0)}`).value.should.equal('asd ');
    });
    describe('defaultIfEmpty', function () {
      it('with empty string', function () {
        Joi.string().defaultIfEmpty('-').validate('').value.should.equal('-');
      });
      it('with string with spaces', function () {
        Joi.string().trim().defaultIfEmpty('-').validate('  ').value.should.equal('-');
      });
      it('with null', function () {
        Joi.string().defaultIfEmpty('-').validate(null).value.should.equal('-');
      });
    });
  });

  describe('phone', function () {
    it('valid phone', function () {
      const result = Joi.phone().validate('(+30) 6999999999');
      result.value.should.equal('(+30) 6999999999');
      should(result.error).be.undefined();
    });
    it('invalid phone', function () {
      const result = Joi.phone().validate('abc');
      result.value.should.equal('abc');
      result.error.message.should.equal('The provided phone is invalid');
    });
    it('valid phone with strip', function () {
      const result = Joi.phone().stripIfInvalid().validate('(+30) 6999999999');
      result.value.should.equal('(+30) 6999999999');
      should(result.error).be.undefined();
    });
    it('invalid phone with strip', function () {
      const result = Joi.phone().stripIfInvalid().validate('abc');
      should(result.value).be.undefined();
      should(result.error).be.undefined();
    });
  });

  describe('stringWithEmpty', function () {
    it('validates and strips null byte', function () {
      Joi.stringWithEmpty().validate(`asd ${String.fromCharCode(0, 0)}asd`).value.should.equal('asd asd');
    });
    it('allows empty or null values', function () {
      const result1 = Joi.stringWithEmpty().validate('');
      should(result1.error).be.undefined();
      result1.value.should.equal('');

      const result2 = Joi.stringWithEmpty().validate(null);
      should(result2.error).be.undefined();
      should(result2.value).be.null();

      const result3 = Joi.stringWithEmpty().validate(undefined);
      should(result3.error).be.undefined();
      should(result3.value).be.undefined();
    });
    describe('defaultIfEmpty', function () {
      it('with empty string', function () {
        Joi.stringWithEmpty().defaultIfEmpty('-').validate('').value.should.equal('-');
      });
      it('with empty spaces string', function () {
        Joi.stringWithEmpty().trim().defaultIfEmpty('-').validate('  ').value.should.equal('-');
      });
      it('with null', function () {
        Joi.stringWithEmpty().defaultIfEmpty('-').validate(null).value.should.equal('-');
      });
    });
  });

  describe('urlInOwnS3', function () {
    it('empty bucket name', function () {
      should(() => Joi.urlInOwnS3().bucket('').validate('https://foo.s3.amazonaws.com')).throw();
    });
    it('url not in s3', function () {
      Joi.urlInOwnS3().bucket('application-form').validate('https://foo.s3.amazonaws.com').error.message
        .should.equal('Invalid path provided');
    });
    it('url in s3 1', function () {
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .validate('https://application-form.s3.amazonaws.com');
      should(underTest.error).be.undefined();
      underTest.value.should.equal('https://application-form.s3.amazonaws.com');
    });
    it('url in s3 2', function () {
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .validate('https://s3.us-east.amazonaws.com/application-form/a/path?asd=foo');
      should(underTest.error).be.undefined();
      underTest.value.should.equal('https://s3.us-east.amazonaws.com/application-form/a/path?asd=foo');
    });
    it('expired tmp url', function () {
      const expiredTimestamp = Math.round(Date.now() / 1000) - 100;
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .errorOnExpiredUrl()
        .validate(`https://application-form.s3.amazonaws.com/tmp/123-456-789?Expires=${expiredTimestamp}`);
      underTest.error.message.should.equal('Your url is expired');
    });
    it('expired tmp url with no rule should succeed', function () {
      const expiredTimestamp = Math.round(Date.now() / 1000) - 100;
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .validate(`https://application-form.s3.amazonaws.com/tmp/123-456-789?Expires=${expiredTimestamp}`);
      should(underTest.error).be.undefined();
    });
    it('not expired tmp url should succeed', function () {
      const futureTimestamp = Math.round(Date.now() / 1000) + 100000;
      const url = `https://application-form.s3.amazonaws.com/tmp/123-456-789?Expires=${futureTimestamp}`;
      const underTest = Joi.urlInOwnS3()
        .bucket('application-form')
        .errorOnExpiredUrl()
        .validate(url);
      should(underTest.error).be.undefined();
      underTest.value.should.equal(url);
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
        const underTest = Joi.urlInOwnS3()
            .bucket('application-form')
            .validate(url);
        underTest.error.message.should.equal('Invalid path provided');
      });
    });
    it('s3 url with malicious domain should throw error', function () {
      const urls = [
        'https://workable-application-form.s3.amazonaws.com.ngrok.app/tmp/123-456-789',
        'https://workable-application-form.s3.amazonaws.com.malicious.io/tmp/123-456-789',
        'https://workable-application-form.s3.amazonaws.comattackerdomain.ly/tmp/123-456-789',
        'https://s3.maliciousurl.maliciousamazonaws.com./workable-application-form/tmp/123-456-789',
      ];

      urls.forEach(url => {
        const underTest = Joi.urlInOwnS3().bucket('workable-application-form').validate(url);
        underTest.error.message.should.equal('Invalid path provided');
      });
    });
  });
  describe('url', function () {
    it('rejects URLs with less than two domain fragments', function () {
      Joi.url().validate('https://foo').error.message.should.equal('"value" must contain a valid domain name');
    });

    it('accepts URLs with two or more domain fragments', function () {
      should(Joi.url().validate('https://foo.com/').error).be.undefined();
    });
  });

  describe('urlWithEmpty', function () {
    it('accepts undefined', function () {
      should(Joi.urlWithEmpty().validate(undefined).error).be.undefined();
    });

    it('accepts null', function () {
      should(Joi.urlWithEmpty().validate(null).error).be.undefined();
    });

    it('accepts ""', function () {
      should(Joi.urlWithEmpty().validate('').error).be.undefined();
    });

    it('rejects URLs with less than two domain fragments', function () {
      Joi.urlWithEmpty().validate('https://foo').error.message.should.equal('"value" must contain a valid domain name');
    });

    it('accepts URLs with two or more domain fragments', function () {
      Joi.urlWithEmpty().validate('https://foo.com/').value.should.equal('https://foo.com/');
    });
  });

  describe('safeHtml', function () {
    it('valid html', function () {
      Joi.safeHtml().validate('<p>banana</p>').value.should.equal('<p>banana</p>');
      Joi.safeHtml().validate('<b>banana</b>').value.should.equal('<b>banana</b>');

      Joi.safeHtml().validate('<a href="https://banana.com" target="_blank" rel="nofollow">banana</a>').value
        .should.equal('<a href="https://banana.com" target="_blank" rel="nofollow">banana</a>');

      Joi.safeHtml().validate('<a href="/j/ABCDEFG">banana</a>').value.should.equal(
        '<a href="/j/ABCDEFG">banana</a>'
      );
    });
    it('invalid tags', function () {
      Joi.safeHtml().validate('<script src="javascript:alert(1);">asd</script><p>foo</p>').value.should.equal(
        '<p>foo</p>'
      );
      Joi.safeHtml().validate('<img src="https://www.google.com" />').value.should.equal('');
    });
    it('invalid attributes', function () {
      Joi.safeHtml().validate('<a href="https://workable.com" name="invalid">asd</a>').value.should.equal(
        '<a href="https://workable.com">asd</a>'
      );
    });
    it('required', function () {
      should(Joi.safeHtml().allow('', null).validate('').error).be.undefined();
      Joi.safeHtml().validate('').error.message.should.equal('"value" is not allowed to be empty');
    });
    it('specify tags', function () {
      Joi
        .safeHtml()
        .allowedTags(['a'])
        .allowedAttributes({
          a: ['href', 'class']
        })
        .validate('<script src="javascript:alert(1);">asd</script><a href="http://google.com" ' +
          'class="aclass" target="_blank"></a><p>foo</p>')
        .value
        .should
        .equal('<a href="http://google.com" class="aclass"></a>foo');
    });
  });

  describe('objectid', function () {
    it('rejects if invalid objectid', function () {
      Joi.objectId().validate('123').error.message.should.equal('Invalid objectId');
    });
    it('accepts if valid objectid', function () {
      should(Joi.objectId().validate('627b825fb99b51cc16df1b41').error).be.undefined();
      Joi.objectId().validate('627b825fb99b51cc16df1b41').value.should.equal('627b825fb99b51cc16df1b41');
    });
  });
});
