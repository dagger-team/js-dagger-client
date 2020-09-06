process.env['_HANDLER'] = 'Something';
process.env['AWS_REGION'] = 'us-east-2';

const FakeLambdaRuntime = require('./FakeLambdaRuntime');

const runtime = new FakeLambdaRuntime();

setTimeout(() => {
    runtime.handleOnce();
}, 0);
