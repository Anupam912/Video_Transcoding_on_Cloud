// multi-cloud-integration/azure-to-aws-backup.js
const { BlobServiceClient } = require('@azure/storage-blob');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Azure Blob Storage and AWS S3 setup
const azureBlobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const s3 = new AWS.S3();

// Helper function to download from Azure Blob Storage
async function downloadFromAzure(containerName, blobName, downloadPath) {
    const containerClient = azureBlobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download(0);
    const blobData = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    fs.writeFileSync(downloadPath, blobData);
}

// Helper function to upload to AWS S3
async function uploadToS3(bucketName, filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
    };
    return s3.upload(params).promise();
}

// Helper function to convert stream to buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => chunks.push(data));
        readableStream.on('end', () => resolve(Buffer.concat(chunks)));
        readableStream.on('error', reject);
    });
}

// Main handler for backing up Azure Blob Storage to AWS S3
exports.azureToAWSBackup = async (req, res) => {
    const { azureContainer, azureBlob, s3Bucket } = req.body;
    const downloadPath = path.join('/tmp', azureBlob);

    try {
        // Step 1: Download file from Azure Blob Storage
        await downloadFromAzure(azureContainer, azureBlob, downloadPath);

        // Step 2: Upload file to AWS S3
        await uploadToS3(s3Bucket, downloadPath, azureBlob);

        res.status(200).json({
            message: 'Backup from Azure Blob Storage to AWS S3 completed',
        });
    } catch (error) {
        console.error('Error in Azure Blob to AWS S3 backup flow:', error);
        res.status(500).json({ error: 'Failed to backup file to AWS', details: error.message });
    }
};
