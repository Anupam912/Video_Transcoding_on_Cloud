// multi-cloud-integration/gcp-to-azure-delivery.js
const { Storage } = require('@google-cloud/storage');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// Google Cloud Storage and Azure Blob Storage setup
const gcsStorage = new Storage();
const azureBlobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Helper function to download from Google Cloud Storage
async function downloadFromGCS(bucketName, fileName, downloadPath) {
    const bucket = gcsStorage.bucket(bucketName);
    const file = bucket.file(fileName);
    const [contents] = await file.download();
    fs.writeFileSync(downloadPath, contents);
}

// Helper function to upload to Azure Blob Storage
async function uploadToAzure(containerName, filePath, fileName) {
    const containerClient = azureBlobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const data = fs.readFileSync(filePath);
    await blockBlobClient.upload(data, data.length);
    return blockBlobClient.url;
}

// Main handler for transferring video from GCS to Azure
exports.gcpToAzureDelivery = async (req, res) => {
    const { gcsBucket, gcsFile, azureContainer } = req.body;
    const downloadPath = path.join('/tmp', gcsFile);

    try {
        // Step 1: Download file from Google Cloud Storage
        await downloadFromGCS(gcsBucket, gcsFile, downloadPath);

        // Step 2: Upload file to Azure Blob Storage
        const azureUrl = await uploadToAzure(azureContainer, downloadPath, gcsFile);

        res.status(200).json({
            message: 'Video transferred from Google Cloud to Azure Blob Storage',
            azureUrl,
        });
    } catch (error) {
        console.error('Error in GCS to Azure delivery flow:', error);
        res.status(500).json({ error: 'Failed to transfer video to Azure', details: error.message });
    }
};
