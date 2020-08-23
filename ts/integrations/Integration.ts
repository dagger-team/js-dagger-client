import { TaskRun } from '@dagger-team/js-dagger-shared';
import { ClientTaskRunParams } from '../types';
import Dagger from '../Dagger';

export interface IntegrationParams {}

export default class Integration {
    isInIntegration(): boolean {
        return true;
    }

    async autoloadIntegration(dagger: Dagger, taskRunParams?: ClientTaskRunParams): Promise<void> {
        // Default is no-op
    }

    async getTaskRun(
        integrationParams: IntegrationParams,
        taskRunParams: ClientTaskRunParams
    ): Promise<TaskRun> {
        let taskRun = new TaskRun(
            taskRunParams.task_name,
            taskRunParams.id
        );

        taskRun = {
            ...taskRun,
            ...taskRunParams
        };

        return taskRun;
    }
}
