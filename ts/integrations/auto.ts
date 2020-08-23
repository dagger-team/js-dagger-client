import Integration from './Integration';

import ECSIntegration from './ECSIntegration';
import LambdaIntegration from './LambdaIntegration';

export const DEFAULT_INTEGRATION = new Integration();

const INTEGRATIONS = {
    'aws_ecs': new ECSIntegration(),
    'aws_lambda': new LambdaIntegration()
};

export const autoloadIntegration = (): Integration | null => {
    for(const integrationName in INTEGRATIONS) {
        const integration = INTEGRATIONS[integrationName];
        if(integration.isInIntegration()) {
            return integration;
        }
    }
    return DEFAULT_INTEGRATION;
};

export const getIntegration = (name: string): Integration | null => {
    if(name === 'auto') {
        return autoloadIntegration();
    }

    if(name in INTEGRATIONS) {
        return INTEGRATIONS[name];
    }

    return DEFAULT_INTEGRATION;
};
