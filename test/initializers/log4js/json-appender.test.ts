import * as appender from '../../../src/initializers/log4js/json-appender';
import 'should';
import * as sinon from 'sinon';
import * as path from 'path';
import * as Log4js from 'log4js';

const sandbox = sinon.createSandbox();

let configureSpy, createErrorLogSpy, createValidLogSpy;

describe('log4js_json_appender', () => {
  beforeEach(() => {
    configureSpy = sandbox.spy(appender, 'configure');
    createErrorLogSpy = sandbox.spy(appender, 'createErrorLog');
    createValidLogSpy = sandbox.spy(appender, 'createValidLog');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should contain method "configure"', () => {
    (typeof appender.configure === 'function').should.equal(true);
  });

  it('should call createValidLog and return valid json object', () => {
    const layout = {
      messagePassThroughLayout: log => {
        return 'test';
      }
    };

    appender.configure({}, layout)({
      level: {
        levelStr: 'INFO'
      },
      startTime: '01-01-1970',
      categoryName: 'testCategoryName',
      data: ['test']
    });
    configureSpy.calledOnce.should.equal(true);
    createErrorLogSpy.calledOnce.should.equal(false);
    createValidLogSpy.calledOnce.should.equal(true);
    createValidLogSpy
      .returned({
        timestamp: '01-01-1970',
        severity: 'INFO',
        categoryName: 'testCategoryName',
        message: 'test',
        context: {}
      })
      .should.equal(true);
  });

  it('should call createErrorLog and return error json object', () => {
    const layout = {
      messagePassThroughLayout: log => {
        return 'test';
      }
    };

    appender.configure({}, layout)({
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
    });
    configureSpy.calledOnce.should.equal(true);
    createValidLogSpy.calledOnce.should.equal(false);
    createErrorLogSpy.calledOnce.should.equal(true);
    createErrorLogSpy.returnValues.should.eql([
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
    let clock = sinon.useFakeTimers(new Date('2019-01-01'));
    const logSpy = sandbox.stub(console, 'log');

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

    let circular = {
      id: 'id',
      temp: {}
    };
    circular.temp = circular;

    var logger = Log4js.getLogger();
    logger.debug(circular);

    logSpy.args.should.eql([
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
    clock.restore();
  });
});
