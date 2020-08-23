import { default as axios, AxiosResponse } from 'axios';

import { TaskRun, TaskRunStaticParameters } from '@dagger-team/js-dagger-shared';

type TaskRunServerParameters = 'updated_at' | 'created_at'

type ClientTaskRunParams = Omit<TaskRun, TaskRunStaticParameters | TaskRunServerParameters>

export interface DaggerStatusClientOptions {
    daggerServerUrl: string;
}

const DEFAULT_DAGGER_STATUS_OPTIONS = {
    daggerServerUrl: 'https://api.getdagger.com'
} as DaggerStatusClientOptions;

interface CreateTaskRunParameters extends Omit<ClientTaskRunParams, 'language' | 'system'> {
    integration?: string;
}

type UpdateTaskRunParameters = Partial<Omit<ClientTaskRunParams, 'task_name' | 'id'>>

interface _TaskStatusApiParams extends ClientTaskRunParams {
    api_token: string;
}

export default class DaggerStatusClient {
    private readonly apiKey: string;

    private readonly options: DaggerStatusClientOptions;

    constructor(apiKey: string, options?: Partial<DaggerStatusClientOptions>) {
        this.apiKey = apiKey;
        this.options = { ...DEFAULT_DAGGER_STATUS_OPTIONS, ...options };
    }

    private async sendTaskStatus(taskRun: TaskRun): Promise<TaskRun> {
        const {
            // Omit things that can't be sent to API
            _version, customer_id, created_at, latest_status_datetime, updated_at,
            ...requestBody
        } = {
            ...taskRun,
            api_token: this.apiKey
        };

        const axiosResponse = await axios
            .post<_TaskStatusApiParams, AxiosResponse<TaskRun>>(
                this.options.daggerServerUrl + '/v1/tasks/status', 
                requestBody
            )
            .catch((err) => {
                console.log('Failed');

                throw err;
            });

        return axiosResponse.data;
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
}
