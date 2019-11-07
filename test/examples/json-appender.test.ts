import * as sinon from 'sinon';
import * as supertest from 'supertest';

const sandbox = sinon.createSandbox();

describe('json-appender', function() {
  let server;
  let clock;
  before(function() {
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_JSON = 'true';
    delete process.env.NEW_RELIC_LICENSE_KEY;
  });

  after(function() {
    process.env.LOG_LEVEL = 'fatal';
    delete process.env.LOG_JSON;
    if (server) server.stop();
    clock.restore();
  });

  before(function() {
    const serverPath = '../../examples/simple-example/app';
    delete require.cache[require.resolve(serverPath)];
    server = require(serverPath);
    server.start();
    clock = sinon.useFakeTimers(new Date('2019-01-01'));
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('/log returns 200 and logs info', async function() {
    const logSpy = sandbox.stub(console, 'log');
    const { text } = await (supertest('localhost:3000') as any).get('/log?').expect(200);
    text.should.eql('logged');
    logSpy.args.should.eql([
      [
        JSON.stringify({
          timestamp: '2019-01-01T00:00:00.000Z',
          severity: 'INFO',
          categoryName: 'log',
          message: 'hello world',
          context: { context: 'foo' }
        })
      ]
    ]);
  });

  it('/log returns 200 and logs info circular', async function() {
    const logSpy = sandbox.stub(console, 'log');
    const { text } = await (supertest('localhost:3000') as any).get('/logCircular?').expect(200);
    text.should.eql('logged');
    logSpy.args.should.eql([
      [
        JSON.stringify({
          timestamp: '2019-01-01T00:00:00.000Z',
          severity: 'INFO',
          categoryName: 'log',
          message: 'hello world',
          context: {
            context: {
              bits: 4096,
              exponent: '0x10001',
              ext_key_usage: ['1.3.6.1.5.5.7.3.1', '1.3.6.1.5.5.7.3.2'],
              fingerprint: 'A5:6A:45:0C:F7:2E:0E:19:90:C5:C7:80:FE:74:48:52:B4:90:3A:C3',
              fingerprint256:
                '3F:E6:48:85:36:FE:09:94:63:AF:2D:EC:FB:B3:15:AF:42:B2:84:3C:C9:1D:40:EA:53:45:75:F0:F8:65:8E:4D',
              issuerCertificate: 'circular_ref',
              modulus: 'C08EE77530CBEA07A31FD2BD44E6C9C',
              serialNumber: '03B38D65C2F65BF692E5C2918F58E2835AF2',
              valid_from: 'Sep 13 07:53:05 2019 GMT',
              valid_to: 'Dec 12 07:53:05 2019 GMT'
            }
          }
        })
      ]
    ]);
  });

  it('/logError returns 505 and logs error', async function() {
    const logSpy = sandbox.stub(console, 'log');
    const { text } = await (supertest('localhost:3000') as any).get('/logError').expect(505);
    text.should.eql('default body');
    const cleanStack = msg => {
      const stack = JSON.parse(msg);
      stack.stack_trace = stack.stack_trace.substring(0, 29);
      return stack;
    };
    logSpy.args
      .map(callArg => callArg.map(cleanStack))
      .should.eql([
        [
          {
            timestamp: '2019-01-01T00:00:00.000Z',
            severity: 'ERROR',
            categoryName: 'log',
            message: 'test - this was a test error',
            stack_trace: 'Error: test\n    at /logError ',
            context: { context: 'foo' }
          }
        ],
        [
          {
            timestamp: '2019-01-01T00:00:00.000Z',
            severity: 'ERROR',
            categoryName: 'orka.errorHandler',
            message: 'test',
            stack_trace: 'Error: test\n    at /logError ',
            context: {
              expose: false,
              statusCode: 505,
              status: 505,
              component: 'koa',
              action: '/logError',
              params: { query: {}, body: {} },
              state: { riviereStartedAt: 1546300800000 }
            }
          }
        ]
      ]);
  });
});
