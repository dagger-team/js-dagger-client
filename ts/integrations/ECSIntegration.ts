import axios from 'axios';

import Integration, { IntegrationParams } from './Integration';
import { TaskRun } from '@dagger-team/js-dagger-shared';
import { ClientTaskRunParams } from '../types';

const ENV_ECS_CONTAINER_METADATA_URI = 'ECS_CONTAINER_METADATA_URI';

interface ECSIntegrationParams extends IntegrationParams {}

interface ECSResponse {
    Labels?: {
        'com.amazonaws.ecs.task-definition-family'?: string,
        'com.amazonaws.ecs.container-name'?: string,
        'com.amazonaws.ecs.task-arn'?: string
    }
}

interface ECSInfo {
    fullInfo: ECSResponse;
    taskDefinitionFamily: string;
    containerName: string;
    taskId: string;
}

export default class ECSIntegration extends Integration {
    isInIntegration(): boolean {
        return !!process.env[ENV_ECS_CONTAINER_METADATA_URI];
    }

    async getInfoFromECS(): Promise<ECSInfo | null> {
        const url = process.env[ENV_ECS_CONTAINER_METADATA_URI];
        const axiosResponse = await axios.get<ECSResponse>(url);
        const ecsFullInfo = axiosResponse.data;

        if(
            !ecsFullInfo.Labels?.['com.amazonaws.ecs.container-name'] ||
            !ecsFullInfo.Labels?.['com.amazonaws.ecs.task-arn'] ||
            !ecsFullInfo.Labels?.['com.amazonaws.ecs.task-definition-family']
        ) {
            console.log('Failed to load ecs integration');
            return;
        }

        const ecsInfo = {
            fullInfo: ecsFullInfo,
            taskDefinitionFamily: ecsFullInfo.Labels['com.amazonaws.ecs.task-definition-family'],
            containerName: ecsFullInfo.Labels['com.amazonaws.ecs.container-name'],
            taskId: ecsFullInfo.Labels['com.amazonaws.ecs.task-arn'].split('/').slice(-1)[0]
        };

        return ecsInfo;
    }

    getTaskMetadataFromECS(ecsInfo: ECSInfo): Record<string, unknown> {
        return {
            taskId: ecsInfo.taskId,
            region: process.env['AWS_REGION'],
            executionEnv: process.env['AWS_EXECUTION_ENV'],
            ecsContainerMetadata: ecsInfo.fullInfo
        };
    }

    getTaskLogsFromECS(ecsInfo: ECSInfo): Record<string, unknown> {
        const logGroupName = '/ecs/' + ecsInfo.taskDefinitionFamily;
        const logStreamName = 'ecs/' + ecsInfo.containerName + '/' + ecsInfo.taskId;

        return {
            'type': 'aws_cloudwatch',
            'data': {
                log_group_name: logGroupName, // eslint-disable-line camelcase
                log_stream_name: logStreamName // eslint-disable-line camelcase
            }
        };
    }

    async getTaskRun(_integrationParams: ECSIntegrationParams, taskRunParams: ClientTaskRunParams): Promise<TaskRun> {
        const ecsInfo = await this.getInfoFromECS();

        let taskName = taskRunParams.task_name;
        if(!taskName) {
            taskName = process.argv[1];
        }

        let taskId = taskRunParams.id;

        let taskMetadata = {};
        let taskLogs = {};
        if(ecsInfo) {
            taskMetadata = this.getTaskMetadataFromECS(ecsInfo);
            taskLogs = this.getTaskLogsFromECS(ecsInfo);
            
            if(!taskId) {
                taskId = ecsInfo.taskId;
            }
        }

        let taskRun = new TaskRun(
            taskName,
            taskId
        );

        taskRun = {
            ...taskRun,
            metadata: taskMetadata,
            logs: taskLogs,
            system: 'aws_ecs',
            ...taskRunParams
        };

        return taskRun;
    }
}
