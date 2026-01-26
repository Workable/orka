import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import * as appender from '../../../src/initializers/log4js/json-appender';
import * as path from 'path';
import * as Log4js from 'log4js';
import { getMockCallArgs } from '../../helpers/assert-helpers';

let configureSpy: any, createErrorLogSpy: any, createValidLogSpy: any;

describe('log4js_json_appender', () => {
  beforeEach(() => {
    configureSpy = mock.method(appender, 'configure', appender.configure);
    createErrorLogSpy = mock.method(appender, 'createErrorLog', appender.createErrorLog);
    createValidLogSpy = mock.method(appender, 'createValidLog', appender.createValidLog);
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('should contain method "configure"', () => {
    assert.strictEqual(typeof appender.configure === 'function', true);
  });

  it('should call createValidLog and return valid json object', () => {
    const layout = {
      messagePassThroughLayout: (log: any) => {
        return 'test';
      }
    };

    appender.configure({}, layout as any)({
      level: {
        levelStr: 'INFO'
      },
      startTime: '01-01-1970',
      categoryName: 'testCategoryName',
      data: ['test']
    } as any);
    assert.strictEqual(configureSpy.mock.calls.length, 1);
    assert.strictEqual(createErrorLogSpy.mock.calls.length, 0);
    assert.strictEqual(createValidLogSpy.mock.calls.length, 1);
    const result = createValidLogSpy.mock.results[0].result;
    assert.deepStrictEqual(result, {
      timestamp: '01-01-1970',
      severity: 'INFO',
      categoryName: 'testCategoryName',
      message: 'test',
      context: {}
    });
  });

  it('should call createErrorLog and return error json object', () => {
    const layout = {
      messagePassThroughLayout: (log: any) => {
        return 'test';
      }
    };

    appender.configure({}, layout as any)({
      level: {
        levelStr: 'ERROR'
      },
      startTime: '01-01-1970',
      categoryName: 'testCategoryName',
      data: [
        {
          message: 'test error',
          stack: 'stack trace'
        }
      ]
    } as any);
    assert.strictEqual(configureSpy.mock.calls.length, 1);
    assert.strictEqual(createValidLogSpy.mock.calls.length, 0);
    assert.strictEqual(createErrorLogSpy.mock.calls.length, 1);
    const results = createErrorLogSpy.mock.results.map((r: any) => r.result);
    assert.deepStrictEqual(results, [
      {
        timestamp: '01-01-1970',
        severity: 'ERROR',
        categoryName: 'testCategoryName',
        message: 'test error - test',
        stack_trace: 'stack trace',
        context: {
          message: 'test error',
          stack: 'stack trace'
        }
      }
    ]);
  });

  it('should correctly print circular json', () => {
    const now = new Date('2019-01-01');
    mock.timers.enable({ apis: ['Date'], now });
    const logSpy = mock.method(console, 'log', () => {});

    const appenders = {
      json: {
        type: path.resolve(path.join(__dirname, '../../../src/initializers/log4js/json-appender'))
      }
    } as any;

    const appendersList = ['json'];

    Log4js.configure({
      appenders,
      categories: {
        default: {
          appenders: appendersList,
          level: 'debug'
        }
      }
    });

    let circular: any = {
      id: 'id',
      temp: {}
    };
    circular.temp = circular;

    var logger = Log4js.getLogger();
    logger.debug(circular);

    assert.deepStrictEqual(getMockCallArgs(logSpy), [
      [
        JSON.stringify({
          timestamp: '2019-01-01T00:00:00.000Z',
          severity: 'DEBUG',
          categoryName: 'default',
          message: '',
          context: { id: 'id', temp: { id: 'id', temp: 'circular_ref' } }
        })
      ]
    ]);
    mock.timers.reset();
  });
});
