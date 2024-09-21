// disaster-recovery/restoreHandler.js
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

// Helper function to download from Google Cloud Storage
async function downloadFromGCS(bucketName, fileName, downloadPath) {
    const bucket = gcs.bucket(bucketName);
    const file = bucket.file(fileName);
    const [contents] = await file.download();
    fs.writeFileSync(downloadPath, contents);
}

// Helper function to download from Azure Blob Storage
async function downloadFromAzure(containerName, blobName, downloadPath) {
    const containerClient = azureBlobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
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
    fs.writeFileSync(downloadPath, blobData);
}

// Helper function to upload file to AWS S3
async function uploadToS3(bucketName, filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const params = { Bucket: bucketName, Key: fileName, Body: fileContent };
    await s3.upload(params).promise();
}

// Main handler to restore assets from backup
exports.restoreAssets = async (req, res) => {
    const { provider, bucketName, fileName, destination } = req.body;
    const tmpFilePath = path.join('/tmp', fileName);

    try {
        // Step 1: Download the file from the backup provider
        if (provider === 'gcs') {
            await downloadFromGCS(bucketName, fileName, tmpFilePath);
        } else if (provider === 'azure') {
            await downloadFromAzure(bucketName, fileName, tmpFilePath);
        } else {
            throw new Error('Invalid provider');
        }

        // Step 2: Restore the file back to AWS S3
        await uploadToS3(destination, tmpFilePath, fileName);

        res.status(200).json({ message: 'Restore successful to AWS S3' });
    } catch (error) {
        console.error('Error during restore:', error);
        res.status(500).json({ error: 'Failed to restore assets', details: error.message });
    }
};
