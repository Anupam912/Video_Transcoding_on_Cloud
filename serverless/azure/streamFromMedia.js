// serverless/azure/streamFromMedia.js
const { DefaultAzureCredential } = require('@azure/identity');
const { AzureMediaServices } = require('@azure/arm-mediaservices');

module.exports = async function (context, req) {
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
    const accountName = process.env.AZURE_MEDIA_ACCOUNT_NAME;
    const assetName = req.body.assetName; // The name of the media asset to stream

    const credential = new DefaultAzureCredential();
    const mediaServicesClient = new AzureMediaServices(credential, subscriptionId);

    try {
        const streamingLocatorName = `locator-${assetName}`;
        const streamingEndpoint = await mediaServicesClient.streamingEndpoints.get(resourceGroup, accountName, 'default');
        const paths = await mediaServicesClient.streamingLocators.listPaths(resourceGroup, accountName, streamingLocatorName);

        const manifestPath = paths.streamingPaths[0].paths[0]; // Get the streaming manifest path
        const streamingUrl = `https://${streamingEndpoint.hostName}${manifestPath}`;

        context.res = {
            status: 200,
            body: { streamingUrl },
        };
    } catch (error) {
        context.log('Error generating streaming URL:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to generate streaming URL', details: error.message },
        };
    }
};
