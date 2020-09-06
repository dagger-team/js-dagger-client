import { default as axios, AxiosResponse } from 'axios';

import { TaskRun } from '@dagger-team/js-dagger-shared';

import { ClientTaskRunParams } from '../types';

export interface DaggerStatusClientOptions {
    daggerServerUrl: string;
}

const DEFAULT_DAGGER_STATUS_OPTIONS = {
    daggerServerUrl: 'https://api.getdagger.com'
} as DaggerStatusClientOptions;

interface _TaskStatusApiParams extends ClientTaskRunParams {
    api_token: string;
}

export default class DaggerStatusClient {
    private readonly apiKey: Promise<string>;

    private readonly options: DaggerStatusClientOptions;

    constructor(apiKey: Promise<string>, options?: Partial<DaggerStatusClientOptions>) {
        this.apiKey = apiKey;
        this.options = { ...DEFAULT_DAGGER_STATUS_OPTIONS, ...options };
    }

    private async sendTaskStatus(taskRun: TaskRun): Promise<TaskRun> {
        const apiKey = await this.apiKey;

        const {
            // Omit things that can't be sent to API
            customer_id, created_at, latest_status_datetime, updated_at, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars, camelcase
            ...requestBody
        } = {
            ...taskRun,
            api_token: apiKey // eslint-disable-line camelcase
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

    async createTaskRun(updates: ClientTaskRunParams): Promise<TaskRun> {
        let taskRun = new TaskRun(updates.task_name, updates.id);
        taskRun = { ...taskRun, ...updates };
        return await this.sendTaskStatus(taskRun);
    }

    async updateTaskRun(taskRun: TaskRun, updates: Omit<ClientTaskRunParams, 'task_name' | 'id'>): Promise<TaskRun> {
        taskRun = { ...taskRun, ...updates };
        return await this.sendTaskStatus(taskRun);
    }
}
