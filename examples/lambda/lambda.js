const Dagger = require('../../dist');
Dagger.auto('Vrd1g7PxaYxDoYf6RQQlAC1sJk0ckE', {
    daggerServerUrl: 'http://localhost:3001'
});

const myLambdaFunction = (event, context, callback) => {
    console.log('My lambda function');

    return {
        output: 'I am here!!!'
    };
};
module.exports.myLambdaFunction = myLambdaFunction;
