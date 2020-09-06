import { default as DaggerStatusClient, DaggerStatusClientOptions } from './status/DaggerStatusClient';
import { ClientTaskRunParams } from './types';
import Integration, { IntegrationParams } from './integrations/Integration';
import { getIntegration } from './integrations/auto';
import * as AWS from 'aws-sdk';

interface WrapParams {
    integrationName?: 'string',
    integration?: Integration,
    integrationParams?: IntegrationParams
}

export default class Dagger {
    private readonly apiKey: Promise<string>;
    readonly statusClient: DaggerStatusClient;

    constructor(apiKey: Promise<string>, statusClientOptions?: Partial<DaggerStatusClientOptions>) {
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

    static async autoloadCredentialsAWSSecretsManager(): Promise<string> {
        const secretsManager = new AWS.SecretsManager();

        const secretsManagerResponse = await secretsManager.getSecretValue({
            SecretId: 'dagger'
        }).promise();

        const secret = JSON.parse(secretsManagerResponse.SecretString)['apiKey'];

        return secret;
    }

    static async autoloadCredentials(apiKey?: string): Promise<string> {
        if(apiKey !== null) {
            return apiKey;
        }

        if(process.env['AWS_REGION']) {
            // Attempt to load from secrets manager
            return Dagger.autoloadCredentialsAWSSecretsManager();
        }

        throw new Error('No token provided, an no usable autoload could be found');
    }

    static auto(apiKey?: string, statusClientOptions?: Partial<DaggerStatusClientOptions>): Dagger {
        const credentialPromise = Dagger.autoloadCredentials(apiKey);

        const dagger = new Dagger(credentialPromise, statusClientOptions);

        const integration = getIntegration('auto');
        integration.autoloadIntegration(dagger);

        return dagger;
    }
}
