import axios from 'axios';

import { TaskRun, TaskRunStaticParameters } from '@dagger-team/js-dagger-shared';
import { wrap } from 'module';

type TaskRunServerParameters = 'updated_at' | 'created_at'

type ClientTaskRunParams = Omit<TaskRun, TaskRunStaticParameters | TaskRunServerParameters>

interface DaggerStatusClientOptions {
    daggerServerUrl: string;
}

const DEFAULT_DAGGER_STATUS_OPTIONS = {
    daggerServerUrl: 'https://api.getdagger.com/'
} as DaggerStatusClientOptions;

interface CreateTaskRunParameters extends ClientTaskRunParams {
    integration?: string;
}

type UpdateTaskRunParameters = Partial<Omit<ClientTaskRunParams, 'task_run_name' | 'id'>>

interface _TaskStatusApiParams extends ClientTaskRunParams {
    apiKey: string;
}

export default class DaggerStatusClient {
    private readonly apiKey: string;

    private readonly options: DaggerStatusClientOptions;

    constructor(apiKey: string, options?: Partial<DaggerStatusClientOptions>) {
        this.apiKey = apiKey;
        this.options = { ...options, ...DEFAULT_DAGGER_STATUS_OPTIONS };
    }

    private async sendTaskStatus(taskRun: TaskRun): Promise<TaskRun> {
        return await axios
            .post<_TaskStatusApiParams, TaskRun>(
                this.options.daggerServerUrl + '/v1/task', 
                {
                    ...taskRun, 
                    apiKey: this.apiKey 
                }
            );
    }

    async createTaskRun(updates: CreateTaskRunParameters): Promise<TaskRun> {
        let taskRun = new TaskRun(updates.task_name, updates.id);
        taskRun = { ...taskRun, ...updates };

        return await this.sendTaskStatus(taskRun);
    }

    async updateTaskRun(taskRun: TaskRun, updates: UpdateTaskRunParameters): Promise<TaskRun> {
        taskRun = { ...taskRun, ...updates };
        return await this.sendTaskStatus(taskRun);
    }

    wrap<WrapFuncInput extends any[], WrapFuncOutput>(func: (...input: WrapFuncInput) => WrapFuncOutput): (...input: WrapFuncInput) => WrapFuncOutput { // eslint-disable-line @typescript-eslint/no-explicit-any
        return function(...input: WrapFuncInput): WrapFuncOutput {
            return func(...input);
        };
    }
}
