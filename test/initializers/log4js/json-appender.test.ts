import * as appender from '../../../src/initializers/log4js/json-appender';
import errorHandler from '../../../src/initializers/koa/error-handler';
import defaults from '../../../src/default-options';
import 'should';
import * as sinon from 'sinon';
import * as path from 'path';
import * as Log4js from 'log4js';
import axios from 'axios';
import * as nock from 'nock';

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

    appender.configure(
      {},
      layout
    )({
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

    appender.configure(
      {},
      layout
    )({
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

  describe('axios errors', () => {
    let axiosError;
    const logged = {
      message: 'Request failed with status code 500',
      name: 'AxiosError',
      isAxiosError: true,
      code: 'ERR_BAD_RESPONSE',
      status: 500,
      config: { method: 'post', url: 'http://orka.test/jobs' },
      response: { status: 500, statusText: 'Internal Server Error', data: { error: 'boom' } }
    };

    const failedCall = (options = {}) => {
      nock('http://orka.test').post('/jobs').query(true).reply(500, { error: 'boom' });
      // New instance: other tests add interceptors to the default one.
      return axios
        .create()
        .post(
          'http://orka.test/jobs?secretKey=QUERY-SECRET',
          { password: 'BODY-SECRET' },
          {
            headers: { Authorization: 'Bearer HEADER-SECRET' },
            ...options
          }
        )
        .catch(e => e);
    };

    const toJson = async (fn: () => any) => {
      const consoleLog = sinon.stub(console, 'log');
      try {
        await fn();
      } finally {
        consoleLog.restore();
      }
      const json: string = consoleLog.args[0][0];
      json.should.not.containEql('SECRET');
      return JSON.parse(json);
    };

    const log = (...data) =>
      toJson(() =>
        appender.configure(
          {},
          { messagePassThroughLayout: l => l.data.join(' ') }
        )({
          level: { levelStr: 'ERROR' },
          startTime: '01-01-1970',
          categoryName: 'test',
          data
        })
      );

    beforeEach(async () => {
      axiosError = await failedCall();
    });

    it('logs only the safe fields of an axios error passed as an argument', async () => {
      (await log(axiosError)).context.should.eql(logged);
      (await log('Calling jobs failed', axiosError)).context.should.eql(logged);
    });

    it('logs only the safe fields of an axios error inside a context object', async () => {
      (await log('Calling jobs failed', { jobId: 1, err: axiosError })).context.should.eql({ jobId: 1, err: logged });
    });

    it('logs only the safe fields of an axios error inside a circular context object', async () => {
      const circular: any = { err: axiosError };
      circular.self = circular;
      (await log('Calling jobs failed', { circular })).context.should.eql({
        circular: { err: logged, self: 'circular_ref' }
      });
    });

    it('leaves out a response body that is a stream', async () => {
      const { context } = await log(await failedCall({ responseType: 'stream' }));
      context.response.should.eql({ status: 500, statusText: 'Internal Server Error' });
    });

    it('logs only the safe fields of an axios error caught by the koa error handler', async () => {
      Log4js.configure({
        appenders: { json: { type: path.resolve(__dirname, '../../../src/initializers/log4js/json-appender') } },
        categories: { default: { appenders: ['json'], level: 'debug' } }
      });
      const ctx: any = { request: { path: '/jobs', query: {}, body: {} }, params: {}, state: {} };
      const handler = errorHandler({ blacklistedErrorCodes: [] }, defaults);

      const { context } = await toJson(() => handler(ctx, () => Promise.reject(axiosError)));
      context.should.eql({
        ...logged,
        component: 'koa',
        action: '/jobs',
        params: { path: {}, query: {}, body: {} },
        state: {}
      });
    });
  });
});
