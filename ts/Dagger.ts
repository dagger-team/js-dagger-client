import DaggerStatusClient from './status/DaggerStatusClient';

export default class Dagger {
    private readonly apiKey: string;
    readonly statusClient: DaggerStatusClient;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.statusClient = new DaggerStatusClient(this.apiKey);
    }

    static auto(apiKey): Dagger {
        const dagger = new Dagger(apiKey);
        return dagger;
    }
}
