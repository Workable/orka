import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import * as appender from '../../../src/initializers/log4js/honeybadger-appender';
import * as Honeybadger from '@honeybadger-io/js';
import { runWithContext } from '../../../src/builder';
import { getMockCallArgs } from '../../helpers/assert-helpers';

let notifySpy: any;

const logLevelLessThanError = 39999;

describe('log4js_honeybadger_appender', () => {
  beforeEach(() => {
    notifySpy = mock.method(Honeybadger, 'notify', () => {});
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('should contain method "configure"', () => {
    assert.strictEqual(typeof appender.configure === 'function', true);
  });

  it('should pass if err is undefined', () => {
    appender.configure()({
      level: 'info'
    });
  });

  it('should call Honeybadger.notify', () => {
    appender.configure()({
      level: 'info',
      categoryName: 'testCategoryName',
      data: 'test data'
    });
    assert.strictEqual(notifySpy.mock.calls.length, 1);
    assert.strictEqual(getMockCallArgs(notifySpy)[0][0].message.startsWith('test data'), true);
    assert.deepStrictEqual(getMockCallArgs(notifySpy)[0][1], {
      context: {},
      headers: {},
      cgiData: {
        'server-software': `Node ${process.version}`
      },
      action: undefined,
      component: 'testCategoryName',
      params: {},
      tags: [],
      fingerprint: 'testCategoryName'
    });
  });

  it('should not call Honeybadger.notify if level less than error', () => {
    appender.configure()({
      level: {
        level: logLevelLessThanError
      },
      categoryName: 'testCategoryName',
      data: 'test data'
    });
    assert.strictEqual(notifySpy.mock.calls.length, 0);
  });

  it('should default the component to name and then compute the fingerprint', () => {
    const err = new Error('omg') as any;
    err.status = 200;
    err.action = '/test/endpoint';
    appender.configure()({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: err
    });
    assert.strictEqual(notifySpy.mock.calls.length, 1);
    assert.deepStrictEqual(getMockCallArgs(notifySpy)[0][1], {
      context: {},
      headers: {},
      cgiData: {
        'server-software': `Node ${process.version}`
      },
      action: '/test/endpoint',
      component: 'testCategoryName',
      params: {},
      tags: [],
      fingerprint: 'testCategoryName_/test/endpoint'
    });
  });

  it('should compute the fingerprint using the component and the action if both exists', () => {
    const err = new Error('omg') as any;
    err.status = 200;
    err.component = 'testController';
    err.action = '/test/endpoint';
    appender.configure()({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: err
    });
    assert.strictEqual(notifySpy.mock.calls.length, 1);
    assert.strictEqual(getMockCallArgs(notifySpy)[0][1].fingerprint, 'testController_/test/endpoint');
  });

  it('should compute the fingerprint using the error name', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }

    const err = new CustomError('omg') as any;
    err.status = 200;
    err.component = 'testController';
    err.action = '/test/endpoint';
    appender.configure()({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: err
    });
    assert.strictEqual(notifySpy.mock.calls.length, 1);
    assert.strictEqual(getMockCallArgs(notifySpy)[0][1].fingerprint, 'CustomError_testController_/test/endpoint');
  });

  it('should use fingerprint from context if it exists', () => {
    const err = new Error('omg') as any;
    err.status = 200;
    err.component = 'testController';
    err.action = '/test/endpoint';
    appender.configure()({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: [err, { fingerprint: 'CustomError' }]
    });
    assert.strictEqual(notifySpy.mock.calls.length, 1);
    assert.strictEqual(getMockCallArgs(notifySpy)[0][1].fingerprint, 'CustomError');
  });

  it('should append to the error message any additional string parameters', () => {
    const err = new Error('omg') as any;
    err.status = 200;
    err.component = 'testController';
    err.action = '/test/endpoint';
    err.name = 'CustomName';
    appender.configure()({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: [err, 'a', 'b', 'c']
    });
    assert.strictEqual(notifySpy.mock.calls.length, 1);
    assert.strictEqual(getMockCallArgs(notifySpy)[0][0].message, 'omg. a. b. c');
    assert.strictEqual(getMockCallArgs(notifySpy)[0][0].name, 'CustomName');
  });

  it('should assign any additional json values to the context', () => {
    const err = new Error('omg') as any;
    runWithContext(new Map([['honeybadgerTags', ['context-tag']]]), () => {
      err.status = 200;
      err.tags = ['error-tag'];
      err.component = 'testController';
      err.action = '/test/endpoint';
      err.context = {
        something: 'ok'
      };
      appender.configure()({
        level: {
          level: 40000
        },
        categoryName: 'testCategoryName',
        data: [
          err,
          {
            a: 'aOK',
            b: 'bOK'
          },
          {
            c: 'cOK'
          },
          { tags: ['tag3'] }
        ]
      });
      assert.strictEqual(notifySpy.mock.calls.length, 1);
      assert.deepStrictEqual(getMockCallArgs(notifySpy)[0][1], {
        context: {
          a: 'aOK',
          b: 'bOK',
          c: 'cOK',
          something: 'ok'
        },
        headers: {},
        cgiData: {
          'server-software': `Node ${process.version}`
        },
        action: '/test/endpoint',
        component: 'testController',
        params: {},
        tags: ['tag3', 'error-tag', 'context-tag'],
        fingerprint: 'testController_/test/endpoint'
      });
    });
  });
});
