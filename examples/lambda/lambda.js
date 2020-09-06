const Dagger = require('../../dist');
Dagger.auto(null, {
    daggerServerUrl: 'http://localhost:3001'
});

const myLambdaFunction = (event, context, callback) => {
    console.log('My lambda function');

    return {
        output: 'I am here!!!'
    };
};
module.exports.myLambdaFunction = myLambdaFunction;
