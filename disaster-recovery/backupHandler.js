// disaster-recovery/backupHandler.js
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

// Helper function to download video from AWS S3
async function downloadFromS3(bucketName, fileName, downloadPath) {
    const params = { Bucket: bucketName, Key: fileName };
    const data = await s3.getObject(params).promise();
    fs.writeFileSync(downloadPath, data.Body);
}

// Helper function to upload video to Google Cloud Storage
async function uploadToGCS(bucketName, filePath, destinationFileName) {
    const bucket = gcs.bucket(bucketName);
    await bucket.upload(filePath, { destination: destinationFileName });
}

// Helper function to upload video to Azure Blob Storage
async function uploadToAzure(containerName, filePath, fileName) {
    const containerClient = azureBlobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const data = fs.readFileSync(filePath);
    await blobClient.upload(data, data.length);
}

// Main handler to back up video assets
exports.backupAssets = async (req, res) => {
    const { provider, bucketName, fileName, destination } = req.body;
    const tmpFilePath = path.join('/tmp', fileName);

    try {
        // Step 1: Download the file from the primary provider (AWS S3)
        await downloadFromS3(bucketName, fileName, tmpFilePath);

        // Step 2: Back up the file to the selected provider
        if (provider === 'gcs') {
            await uploadToGCS(destination, tmpFilePath, fileName);
        } else if (provider === 'azure') {
            await uploadToAzure(destination, tmpFilePath, fileName);
        } else {
            throw new Error('Invalid provider');
        }

        res.status(200).json({ message: `Backup successful to ${provider}` });
    } catch (error) {
        console.error('Error during backup:', error);
        res.status(500).json({ error: 'Failed to back up assets', details: error.message });
    }
};
