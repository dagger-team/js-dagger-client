const myLambdaFunction = require('./lambda').myLambdaFunction;

class FakeLambdaRuntime {
    constructor() {
        this.handler = myLambdaFunction;
    }

    handleOnce() {
        this.handler(
            {
                'event': true
            }, 
            {
                /* eslint-disable camelcase */
                function_name: 'fake-function',
                aws_request_id: 'id-' + new Date().getTime(),
                log_group_name: 'logs',
                log_stream_name: 'log-stream'
                /* eslint-enable */
            },
            () => null
        );
    }
}
module.exports = FakeLambdaRuntime;

require.cache['/var/runtime/Runtime.js'] = module;
