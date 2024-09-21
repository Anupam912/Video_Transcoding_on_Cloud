// hybrid-cloud/hybridUploadOnPremise.js
const fs = require('fs');
const AWS = require('aws-sdk');
const { BlobServiceClient } = require('@azure/storage-blob');
const { Storage } = require('@google-cloud/storage');

// Configuration for each cloud provider
const awsS3 = new AWS.S3();
const gcsStorage = new Storage();
const azureBlobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Helper function to upload file to AWS S3
async function uploadToS3(filePath, bucketName, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
    };
    return awsS3.upload(params).promise();
}

// Helper function to upload file to Google Cloud Storage
async function uploadToGCS(filePath, bucketName, fileName) {
    const bucket = gcsStorage.bucket(bucketName);
    const [file] = await bucket.upload(filePath, {
        destination: fileName,
    });
    return file;
}

// Helper function to upload file to Azure Blob Storage
async function uploadToAzure(filePath, containerName, fileName) {
    const containerClient = azureBlobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const data = fs.readFileSync(filePath);
    await blockBlobClient.upload(data, data.length);
    return blockBlobClient.url;
}

exports.uploadOnPremVideo = async function (req, res) {
    const { provider, filePath, fileName } = req.body; // provider can be 'aws', 'gcs', 'azure'

    try {
        if (provider === 'aws') {
            await uploadToS3(filePath, 'your-s3-bucket', fileName);
            res.status(200).json({ message: `File uploaded to AWS S3: ${fileName}` });
        } else if (provider === 'gcs') {
            await uploadToGCS(filePath, 'your-gcs-bucket', fileName);
            res.status(200).json({ message: `File uploaded to Google Cloud Storage: ${fileName}` });
        } else if (provider === 'azure') {
            const azureUrl = await uploadToAzure(filePath, 'your-azure-container', fileName);
            res.status(200).json({ message: `File uploaded to Azure Blob Storage: ${fileName}`, url: azureUrl });
        } else {
            res.status(400).json({ error: 'Invalid provider' });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
};
