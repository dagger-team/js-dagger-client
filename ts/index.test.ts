import assert = require('assert');

import { helloWorld } from './index';

it('hello', () => {
    helloWorld();
    assert(true, 'is true');
});
