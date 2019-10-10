import * as appender from '../../../src/initializers/log4js/json-appender';
import 'should';
import * as sinon from 'sinon';

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
    appender.configure()({
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
    appender.configure()({
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
    createErrorLogSpy
      .returned({
        timestamp: '01-01-1970',
        severity: 'ERROR',
        categoryName: 'testCategoryName',
        message: 'test error',
        stack_trace: 'stack trace',
        context: {
          message: 'test error',
          stack: 'stack trace'
        }
      })
      .should.equal(true);
  });
});