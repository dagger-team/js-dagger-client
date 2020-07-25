# Status Client Libarary

Library used to log dagger task status from within the runtime of the task itself.

Usable by both the job processor client library (also in this repo), and by any
consumer of the API (status only dagger customers).

Different levels of integration are allowed, designed for varying levels of
customization based on use-case.

### Simple, automatic integration:

```js
// By just importing the dagger client, and calling init with your API key, dagger
// will attempt to automatically detect the environment and log task run status to 
// dagger.

const Dagger = require('js-dagger-client');
Dagger.init('apikey');
```

### Function wrapper:

```js
const Dagger = require('js-dagger-client');
const daggerClient = new Dagger('apikey');

const yourTaskFunction = () => {
    console.log('Doing something....')
};

daggerClient.wrap(yourTaskFunction);
```

### Fully custom:

```js
const Dagger, { TaskRunStatusTypes } = require('js-dagger-client');
const daggerClient = new Dagger('apikey');

const yourTaskFunction = () => {
    const task = daggerClient.createTaskRun('a unqiue task run id', TaskRunStatusTypes.running, { input: 'Some input' });

    try:
        console.log('Doing something');
        daggerClient.updateTask(task, TaskRunStatusTypes.succeeded, { output: 'Some output' });
    catch(err):
        daggerClient.updateTask(task, TaskRunStatusTypes.failed, { error: err });
};

yourTaskFunction();
```
