import Integration, { IntegrationParams } from './Integration';
import { TaskRun } from '@dagger-team/js-dagger-shared';
import { ClientTaskRunParams } from '../types';
import Dagger from '../Dagger';

interface LambdaIntegrationParams extends IntegrationParams {
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
    lambdaContext: {
        /* eslint-disable camelcase */
        function_name: string,
        aws_request_id: string,
        log_group_name: string,
        log_stream_name: string
        /* eslint-enable */
    };
}

/**
 * This is what we expect to find when we monkeypatch inside of autoloadIntegration.
 * 
 * For node 12 on AWS Lambda, the main runtime happens inside /var/runtime/Runtime.js
 * we jack into that so we know every time the lambda function is called within
 * this node process, and we can automatically log it to the dagger server.
 */
interface AWSLambdaRuntime {
    prototype: {
        handler: (event, context, callback) => Promise<Record<string, unknown>>;
        handleOnce: () => void;
    }
}

export default class LambdaIntegration extends Integration {
    isInIntegration(): boolean {
        return !!process.env['_HANDLER'];
    }

    wrapLambdaRuntime(dagger: Dagger, taskRunParams?: ClientTaskRunParams): void {
        console.log('wrapLambdaRuntime');
        const _this = this;

        const Runtime = require.cache['/var/runtime/Runtime.js'].exports as AWSLambdaRuntime;
        const previousHandleOnce = Runtime.prototype.handleOnce;

        const newHandleOnce = function(...args) {
            if(this.__daggerInitialized) {
                previousHandleOnce.apply(this, ...args);
            }
            this.__daggerInitialized = true;

            const previousHandler = this.handler;
            const newHandler = async function(event, context, callback) {
                const integrationParams: LambdaIntegrationParams = {
                    lambdaContext: context
                };

                const wrappedHandler = dagger.wrap(
                    previousHandler,
                    taskRunParams,
                    {
                        integration: _this,
                        integrationParams: integrationParams
                    }
                );

                await wrappedHandler(event, context, callback);
            };
            this.handler = newHandler;

            previousHandleOnce.apply(this, ...args);
        };

        Runtime.prototype.handleOnce = newHandleOnce;
    }

    async autoloadIntegration(dagger: Dagger, taskRunParams: ClientTaskRunParams): Promise<void> {
        process.nextTick(() => {
            this.wrapLambdaRuntime(dagger, taskRunParams);
        });
    }

    async getTaskRun(integrationParams: LambdaIntegrationParams, taskRunParams: ClientTaskRunParams): Promise<TaskRun> {
        let taskName = taskRunParams.task_name;
        let taskId = taskRunParams.id;

        if(!taskName) {
            taskName = integrationParams.lambdaContext.function_name;
        }
        if(!taskId) {
            taskId = integrationParams.lambdaContext.aws_request_id;
        }

        let taskRun = new TaskRun(
            taskName,
            taskId
        );

        taskRun = {
            ...taskRun,
            metadata: {
                region: process.env['AWS_REGION']
            },
            logs: {
                type: 'aws_cloudwatch',
                data: {
                    /* eslint-disable camelcase */
                    log_group_name: integrationParams.lambdaContext.log_group_name,
                    log_stream_name: integrationParams.lambdaContext.log_stream_name,
                    time_filter: true
                    /* eslint-enable */
                }
            },
            system: 'aws_lambda'
        };

        return taskRun;
    }
}
