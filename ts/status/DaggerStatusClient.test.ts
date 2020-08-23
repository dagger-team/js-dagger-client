import axios from 'axios';

import { TaskRun, TaskRunStatusType } from '@dagger-team/js-dagger-shared';
import DaggerStatusClient from './DaggerStatusClient';
import { wrap } from 'module';

const _defaultApiUrl = 'https://api.getdagger.com/v1/task';

jest.mock('axios');
const mockedAxios = (axios as jest.Mocked<typeof axios>);

describe('Test DaggerStatusClient', () => {
    it('should create task run', async () => {
        const testApiKey = 'testApiKey';

        const client = new DaggerStatusClient(testApiKey);

        const testRun = new TaskRun('name', 'id');

        client.createTaskRun(
            testRun
        );

        expect(mockedAxios.post)
            .toHaveBeenCalledWith(
                _defaultApiUrl, 
                {
                    ...testRun, 
                    ...{
                        apiKey: testApiKey
                    } 
                }
            );
    });

    it('should allow configuring of server url ', async () => {
        const testApiKey = 'testApiKey';

        const client = new DaggerStatusClient(testApiKey, { daggerServerUrl: 'http://localhost' });

        const testRun = new TaskRun('name', 'id');

        client.createTaskRun(
            testRun
        );

        expect(mockedAxios.post)
            .toHaveBeenCalledWith(
                'http://localhost/v1/task', 
                {
                    ...testRun, 
                    ...{
                        apiKey: testApiKey
                    } 
                }
            );
    });

    describe('Should updateTaskRun', () => {
        const updateFields = {
            'status': 'failed',
            'input': { 'asdf': 'input' },
            'output': { 'output': 'fdsa' },
            'metadata': { 'metadata': 'fdsa' },
            'logs': { 'asdf': 'logs' }
        };

        for(const field in updateFields) {
            it('should update ' + field, async () => {
                const testApiKey = 'testApiKey';
                const client = new DaggerStatusClient(testApiKey);
        
                const testRun = new TaskRun('name', 'id');

                client.updateTaskRun(
                    testRun,
                    {
                        [field]: updateFields[field]
                    }
                );

                expect(mockedAxios.post)
                    .toHaveBeenCalledWith(
                        _defaultApiUrl, 
                        {
                            ...testRun, 
                            ...{
                                apiKey: testApiKey,
                                [field]: updateFields[field]
                            } 
                        }
                    );
            });
        }
    });
});
