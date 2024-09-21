// serverless/azure/uploadToBlob.js
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = 'videos';
    const { fileName, fileContent } = req.body;

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        await blockBlobClient.upload(Buffer.from(fileContent, 'base64'), Buffer.byteLength(fileContent, 'base64'));
        context.res = {
            status: 200,
            body: { message: 'Video uploaded to Azure Blob Storage successfully' },
        };
    } catch (error) {
        context.log('Error uploading video to Blob Storage:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to upload to Azure Blob Storage', details: error.message },
        };
    }
};
