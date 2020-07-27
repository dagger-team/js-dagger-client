import DaggerStatusClient from './DaggerStatusClient';

const client = new DaggerStatusClient('testtest');

function test(a: number, b: string, c?: string[]): string {
    return 'Hello ' + a + ' ' + b;
}

console.log(test(1, 'asdf', ['asdf']));
console.log(client.wrap(test)(1, 'asdf'));           // Works!
console.log(client.wrap(test)(1, 'asdf', ['asdf'])); // Works!

console.log(client.wrap<[number], string>(test)(1, 'asdf', ['asdf']));                   // Fails
console.log(client.wrap<[number, string, string[]?], string>(test)(1, 'asdf', ['asdf'])); // Works!
