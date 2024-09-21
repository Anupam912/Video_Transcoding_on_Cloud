// hybrid-cloud/hybridDataSync.js
const AWS = require('aws-sdk');
const { DefaultAzureCredential } = require('@azure/identity');
const { AzureFileSyncClient } = require('@azure/arm-storagefile');
const { StorageTransferServiceClient } = require('@google-cloud/storage-transfer');

// AWS DataSync setup
const dataSync = new AWS.DataSync();
// Google Cloud Storage Transfer setup
const transferClient = new StorageTransferServiceClient();

exports.syncOnPremToCloud = async function (req, res) {
    const { provider, taskArn, sourcePath, destinationBucket, syncGroupName } = req.body;

    try {
        if (provider === 'aws') {
            // AWS DataSync
            const result = await dataSync.startTaskExecution({ TaskArn: taskArn }).promise();
            res.status(200).json({ message: 'AWS DataSync task started', executionArn: result.TaskExecutionArn });
        } else if (provider === 'azure') {
            // Azure File Sync
            const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
            const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
            const storageSyncService = process.env.AZURE_STORAGE_SYNC_SERVICE;
            const credential = new DefaultAzureCredential();
            const fileSyncClient = new AzureFileSyncClient(credential, subscriptionId);

            const result = await fileSyncClient.syncGroups.sync(resourceGroup, storageSyncService, syncGroupName);
            res.status(200).json({ message: 'Azure File Sync started', details: result });
        } else if (provider === 'gcs') {
            // Google Cloud Storage Transfer
            const transferJob = {
                projectId: 'your-gcp-project-id',
                transferSpec: {
                    posixDataSource: {
                        rootDirectory: sourcePath,
                    },
                    gcsDataSink: {
                        bucketName: destinationBucket,
                    },
                },
            };

            const [operation] = await transferClient.createTransferJob({ transferJob });
            res.status(200).json({ message: 'Google Cloud Transfer started', jobName: operation.name });
        } else {
            res.status(400).json({ error: 'Invalid provider' });
        }
    } catch (error) {
        console.error('Error syncing on-premise to cloud:', error);
        res.status(500).json({ error: 'Failed to sync data', details: error.message });
    }
};
