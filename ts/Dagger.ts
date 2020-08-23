import { default as DaggerStatusClient, DaggerStatusClientOptions } from './status/DaggerStatusClient';
import { TaskRun } from '@dagger-team/js-dagger-shared';

export default class Dagger {
    private readonly apiKey: string;
    readonly statusClient: DaggerStatusClient;

    constructor(apiKey: string, statusClientOptions?: Partial<DaggerStatusClientOptions>) {
        this.apiKey = apiKey;
        this.statusClient = new DaggerStatusClient(this.apiKey, statusClientOptions);
    }

    wrap<WrapFuncInput extends any[], WrapFuncOutput>(
        func: (...input: WrapFuncInput) => Promise<WrapFuncOutput>
    ): (...input: WrapFuncInput) => Promise<WrapFuncOutput> { // eslint-disable-line @typescript-eslint/no-explicit-any
        return async (...input: WrapFuncInput): Promise<WrapFuncOutput> => {
            const taskRun = await this.statusClient.createTaskRun({
                task_name: 'asdf',
                id: 'asdf',
                status: 'started',
                input: {
                    'args': input
                }
            });

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

    static auto(apiKey): Dagger {
        const dagger = new Dagger(apiKey);
        return dagger;
    }
}
