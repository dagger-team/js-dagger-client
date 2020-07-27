"use strict";
exports.__esModule = true;
var DaggerStatusClient_1 = require("./DaggerStatusClient");
var client = new DaggerStatusClient_1["default"]('testtest');
function test(a, b, c) {
    return 'Hello ' + a + ' ' + b;
}
console.log(test(1, 'asdf', ['asdf']));
console.log(client.wrap(test)(1, 'asdf')); // Works!
console.log(client.wrap(test)(1, 'asdf', ['asdf'])); // Works!
console.log(client.wrap(test)(1, 'asdf', ['asdf'])); // Fails
console.log(client.wrap(test)(1, 'asdf', ['asdf'])); // Works!
