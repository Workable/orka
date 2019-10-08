import * as appender from '../../../src/initializers/log4js/honeybadger-appender';
import 'should';
import * as Honeybadger from 'honeybadger';
import * as sinon from 'sinon';

const sandbox = sinon.createSandbox();

let notifySpy;

const logLevelLessThanError = 39999;

describe('log4js_honeybadger_appender', () => {
  beforeEach(() => {
    notifySpy = sandbox.spy();
    sandbox.stub(Honeybadger, 'notify').callsFake(notifySpy);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should contain method "configure"', () => {
    (typeof appender.configure === 'function').should.equal(true);
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
    notifySpy.calledOnce.should.equal(true);
    notifySpy.args[0][0].message.startsWith('test data').should.equal(true);
    notifySpy.args[0][1].should.eql({
      context: {},
      headers: {},
      cgiData: {
        'server-software': `Node ${process.version}`
      },
      action: undefined,
      component: 'testCategoryName',
      params: {},
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
    notifySpy.callCount.should.equal(0);
  });

  it('should not call Honeybadger.notify if err.status exists in the filter_status', () => {
    const err = new Error('omg') as any;
    err.status = 200;
    appender.configure([200])({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: err
    });
    notifySpy.callCount.should.equal(0);
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
    notifySpy.callCount.should.equal(1);
    notifySpy.args[0][1].should.eql({
      context: {},
      headers: {},
      cgiData: {
        'server-software': `Node ${process.version}`
      },
      action: '/test/endpoint',
      component: 'testCategoryName',
      params: {},
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
    notifySpy.callCount.should.equal(1);
  });

  it('should append to the error message any additional string parameters', () => {
    const err = new Error('omg') as any;
    err.status = 200;
    err.component = 'testController';
    err.action = '/test/endpoint';
    appender.configure()({
      level: {
        level: 40000
      },
      categoryName: 'testCategoryName',
      data: [err, 'a', 'b', 'c']
    });
    notifySpy.callCount.should.equal(1);
    notifySpy.args[0][0].message.should.equal('omg. a. b. c');
  });

  it('should assign any additional json values to the context', () => {
    const err = new Error('omg') as any;
    err.status = 200;
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
        }
      ]
    });
    notifySpy.callCount.should.equal(1);
    notifySpy.args[0][1].should.eql({
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
      fingerprint: 'testController_/test/endpoint'
    });
  });
});
