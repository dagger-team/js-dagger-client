import Dagger from '../ts/Dagger';
const dagger = new Dagger(
    'Vrd1g7PxaYxDoYf6RQQlAC1sJk0ckE',
    {
        daggerServerUrl: 'http://localhost:3001'
    }
);

const helloWorld = async (a: string): Promise<string> => {
    return 'Hello world, ' + a;
};
const helloWorldWrapped = dagger.wrap(helloWorld);

(async () => {
    await helloWorldWrapped('I am here!');
})();
