import Dagger from './Dagger';
import DaggerStatusClient from './status/DaggerStatusClient';
import { TaskRun } from '@dagger-team/js-dagger-shared';

jest.mock('./status/DaggerStatusClient');
const mockedDaggerStatusClient = (DaggerStatusClient as jest.MockedClass<typeof DaggerStatusClient>);

describe('Dagger', () => {
    beforeEach(() => {
        mockedDaggerStatusClient.mockReset();
    });

    it('Should init', () => {
        const apiKey = 'asdf';
        const dagger = new Dagger(apiKey);

        expect(dagger).toBeDefined();
        expect(mockedDaggerStatusClient).toHaveBeenCalledWith(apiKey, undefined);
    });

    describe('wrap function', () => {
        it('simple', async () => {
            const testApiKey = 'testApiKey';
            const client = new Dagger(testApiKey);
    
            const wrapFunc = jest.fn<Promise<string>, [string]>(async (a: string) => a + ' world');
            const fakeTaskRun = new TaskRun('fake', 'run');
            mockedDaggerStatusClient.prototype.createTaskRun.mockReturnValue((async () => fakeTaskRun)());

            const wrappedFunc = client.wrap(wrapFunc);

            await wrappedFunc('Hello');

            expect(wrapFunc).toHaveBeenCalledWith('Hello');
            expect(mockedDaggerStatusClient.prototype.createTaskRun).toBeCalled();
            expect(mockedDaggerStatusClient.prototype.updateTaskRun)
                .toBeCalledWith(
                    fakeTaskRun,
                    {
                        status: 'succeeded',
                        output: 'Hello world'
                    }
                );
        });

        test('simple, failure', async () => {
            const testApiKey = 'testApiKey';
            const client = new Dagger(testApiKey);
    
            const fakeTaskRun = new TaskRun('fake', 'run');;
            const testError = new Error('Whoopsie');

            let thrownError = null;
            let wrapFunc = null;

            try {
                wrapFunc = jest.fn<Promise<string>, [string]>(async (a: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                    throw testError;
                });
                mockedDaggerStatusClient.prototype.createTaskRun.mockReturnValue((async () => fakeTaskRun)());

                const wrappedFunc = client.wrap(wrapFunc);

                await wrappedFunc('Hello');
            } catch(err) {
                thrownError = err;
            }

            expect(thrownError).toEqual(testError);
            expect(wrapFunc).toHaveBeenCalledWith('Hello');

            expect(mockedDaggerStatusClient.prototype.createTaskRun).toBeCalled();
            expect(mockedDaggerStatusClient.prototype.updateTaskRun)
                .toBeCalledWith(
                    fakeTaskRun,
                    {
                        status: 'failed',
                        output: {
                            'error': testError
                        }
                    }
                );
        });
    });
});
