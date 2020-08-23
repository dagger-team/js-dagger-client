# Status Client Libarary

Library used to log dagger task status from within the runtime of the task itself.

Usable by both the job processor client library (also in this repo), and by any
consumer of the API (status only dagger customers).

Different levels of integration are allowed, designed for varying levels of
customization based on use-case.

### Simple, automatic integration:

By just importing the dagger client, and calling init with your API key, dagger
will attempt to automatically detect the environment and log task run status to 
dagger.

```js

const Dagger = require('js-dagger-client');
Dagger.init('apikey');

// or:
Dagger.init('apikey', {integrationName: 'aws_lambda'});

// or:
Dagger.init('apikey', {integration: MyCustomIntegration()}})
```

### Function wrapper:

A function wrapper is provided that will log any call to that function as a new
task run. Task run id will be automatically generated, or you can provide a
task run id generator via the `getTaskRunId` parameter.

```js
const Dagger = require('js-dagger-client');
const daggerClient = new Dagger('apikey').statusClient;

const yourTaskFunction = () => {
    console.log('Doing something....')
};

daggerClient.wrap(
    yourTaskFunction, 
    { 
        taskName: 'some task name'
    },
    {
        // or...
        integration_name: 'aws_ecs'
        // or...
        integration: MyCustomIntegration()
    }
);
```

### Fully custom:

Using the daggerClient you can create and update your own task run.

```js
const Dagger, { TaskRunStatusTypes } = require('js-dagger-client');
const daggerClient = new Dagger('apikey');

const yourTaskFunction = () => {
    const task_run = daggerClient.createTaskRun('some task name', 'a unqiue task run id', TaskRunStatusTypes.running, { input: 'Some input' });

    try:
        console.log('Doing something');
        daggerClient.updateTaskRun(task_run, TaskRunStatusTypes.succeeded, { output: 'Some output' });
    catch(err):
        daggerClient.updateTaskRun(task_run, TaskRunStatusTypes.failed, { error: err });
};

yourTaskFunction();
```
