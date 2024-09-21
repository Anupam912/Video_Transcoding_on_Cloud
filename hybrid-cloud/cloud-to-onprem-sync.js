// hybrid-cloud/cloud-to-onprem-sync.js
const AWS = require('aws-sdk');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

// AWS S3 setup
const s3 = new AWS.S3();
// Azure Blob setup
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
// Google Cloud Storage setup
const storage = new Storage();

exports.syncCloudToOnPrem = async function (req, res) {
    const { provider, bucketName, fileName, destinationPath, containerName, blobName } = req.body;

    try {
        if (provider === 'aws') {
            // Sync from AWS S3 to on-premise
            const params = { Bucket: bucketName, Key: fileName };
            const data = await s3.getObject(params).promise();
            fs.writeFileSync(destinationPath, data.Body);
            res.status(200).json({ message: `File synced from AWS S3 to on-prem: ${fileName}` });
        } else if (provider === 'azure') {
            // Sync from Azure Blob Storage to on-premise
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobName);
            const downloadBlockBlobResponse = await blobClient.download(0);
            const blobData = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
            fs.writeFileSync(destinationPath, blobData);
            res.status(200).json({ message: `File synced from Azure Blob to on-prem: ${blobName}` });
        } else if (provider === 'gcs') {
            // Sync from Google Cloud Storage to on-premise
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(fileName);
            const [contents] = await file.download();
            fs.writeFileSync(destinationPath, contents);
            res.status(200).json({ message: `File synced from Google Cloud Storage to on-prem: ${fileName}` });
        } else {
            res.status(400).json({ error: 'Invalid provider' });
        }
    } catch (error) {
        console.error('Error syncing from cloud to on-prem:', error);
        res.status(500).json({ error: 'Failed to sync data from cloud to on-prem', details: error.message });
    }
};

// Helper function for Azure Blob to buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => chunks.push(data));
        readableStream.on('end', () => resolve(Buffer.concat(chunks)));
        readableStream.on('error', reject);
    });
}
