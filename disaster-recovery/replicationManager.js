// disaster-recovery/replicationManager.js
const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// AWS S3 setup
const s3 = new AWS.S3();

// Google Cloud Storage setup
const gcs = new Storage();

// Azure Blob Storage setup
const azureBlobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Helper function to replicate video across cloud providers
async function replicateData(sourceProvider, destinationProvider, bucketName, fileName) {
    const tmpFilePath = path.join('/tmp', fileName);

    // Step 1: Download the file from the source provider
    if (sourceProvider === 'aws') {
        const params = { Bucket: bucketName, Key: fileName };
        const data = await s3.getObject(params).promise();
        fs.writeFileSync(tmpFilePath, data.Body);
    } else if (sourceProvider === 'gcs') {
        const bucket = gcs.bucket(bucketName);
        const file = bucket.file(fileName);
        const [contents] = await file.download();
        fs.writeFileSync(tmpFilePath, contents);
    } else if (sourceProvider === 'azure') {
        const containerClient = azureBlobServiceClient.getContainerClient(bucketName);
        const blobClient = containerClient.getBlobClient(fileName);
        const downloadBlockBlobResponse = await blobClient.download(0);
        const streamToBuffer = (stream) => {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        };
        const blobData = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
        fs.writeFileSync(tmpFilePath, blobData);
    } else {
        throw new Error('Invalid source provider');
    }

    // Step 2: Upload the file to the destination provider
    if (destinationProvider === 'aws') {
        const fileContent = fs.readFileSync(tmpFilePath);
        const params = { Bucket: bucketName, Key: fileName, Body: fileContent };
        await s3.upload(params).promise();
    } else if (destinationProvider === 'gcs') {
        const bucket = gcs.bucket(bucketName);
        await bucket.upload(tmpFilePath, { destination: fileName });
    } else if (destinationProvider === 'azure') {
        const containerClient = azureBlobServiceClient.getContainerClient(bucketName);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        const data = fs.readFileSync(tmpFilePath);
        await blobClient.upload(data, data.length);
    } else {
        throw new Error('Invalid destination provider');
    }
}

// Main handler to manage data replication
exports.replicateData = async (req, res) => {
    const { sourceProvider, destinationProvider, bucketName, fileName } = req.body;

    try {
        await replicateData(sourceProvider, destinationProvider, bucketName, fileName);
        res.status(200).json({ message: `Replication successful from ${sourceProvider} to ${destinationProvider}` });
    } catch (error) {
        console.error('Error during replication:', error);
        res.status(500).json({ error: 'Failed to replicate data', details: error.message });
    }
};
