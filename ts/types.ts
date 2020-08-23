import { TaskRun, TaskRunStaticParameters } from '@dagger-team/js-dagger-shared';

type TaskRunServerParameters = 'updated_at' | 'created_at' | 'latest_status_datetime' | 'customer_id'
type TaskRunDefaultParameters = 'language' | 'system'

export type ClientTaskRunParams = Partial<Omit<
    TaskRun, 
    TaskRunStaticParameters | 
    TaskRunServerParameters |
    TaskRunDefaultParameters
>>
