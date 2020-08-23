import { default as DaggerStatusClient, DaggerStatusClientOptions } from './status/DaggerStatusClient';
import { ClientTaskRunParams } from './types';
import Integration, { IntegrationParams } from './integrations/Integration';
import { getIntegration } from './integrations/auto';

interface WrapParams {
    integrationName?: 'string',
    integration?: Integration,
    integrationParams?: IntegrationParams
}

export default class Dagger {
    private readonly apiKey: string;
    readonly statusClient: DaggerStatusClient;

    constructor(apiKey: string, statusClientOptions?: Partial<DaggerStatusClientOptions>) {
        this.apiKey = apiKey;
        this.statusClient = new DaggerStatusClient(this.apiKey, statusClientOptions);
    }

    /**
     * Wraps a function, treating it as a Dagger task. started, succeeded and
     * failed statuses will be logged to dagger.
     * 
     * @param func The function to wrap
     */
    wrap<WrapFuncInput extends any[], WrapFuncOutput>(
        func: (...input: WrapFuncInput) => Promise<WrapFuncOutput>,
        clientTaskRunParams?: ClientTaskRunParams,
        options?: WrapParams
    ): (...input: WrapFuncInput) => Promise<WrapFuncOutput> { // eslint-disable-line @typescript-eslint/no-explicit-any
        return async (...input: WrapFuncInput): Promise<WrapFuncOutput> => {
            let integration = options?.integration;
            if(!integration) {
                integration = getIntegration(options?.integrationName);
            }

            console.log(integration);

            let taskRun = await integration.getTaskRun(
                options?.integrationParams || {},
                {
                    ...clientTaskRunParams,
                    status: 'started',
                    input: {
                        'args': input
                    }
                }
            ); 

            taskRun = await this.statusClient.createTaskRun(taskRun);

            try {
                const output = await func(...input);

                await this.statusClient.updateTaskRun(taskRun, {
                    status: 'succeeded',
                    output: {
                        output
                    }
                });

                return output;
            } catch(error) {
                await this.statusClient.updateTaskRun(taskRun, {
                    status: 'failed',
                    output: {
                        error: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        }
                    }
                });

                throw error;
            }
        };
    }

    static auto(apiKey: string, statusClientOptions?: Partial<DaggerStatusClientOptions>): Dagger {
        const dagger = new Dagger(apiKey, statusClientOptions);

        console.log('autoload');
        const integration = getIntegration('auto');
        integration.autoloadIntegration(dagger);

        return dagger;
    }
}
