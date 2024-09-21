// edge-computing/azureEdgeProcessing.js
const { generateThumbnail, transcodeVideo } = require('./videoProcessing');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Helper function to convert a stream to buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => chunks.push(data));
        readableStream.on('end', () => resolve(Buffer.concat(chunks)));
        readableStream.on('error', reject);
    });
}

module.exports = async function (context, req) {
    const videoFileName = path.basename(req.originalUrl);

    const tmpVideoPath = `/tmp/${videoFileName}`;
    const tmpThumbnailPath = `/tmp/${videoFileName.split('.')[0]}-thumbnail.jpg`;

    try {
        // Step 1: Download the video from Azure Blob Storage
        const containerClient = blobServiceClient.getContainerClient('your-container');
        const blobClient = containerClient.getBlobClient(`videos/${videoFileName}`);
        const downloadResponse = await blobClient.download(0);
        const videoStream = await streamToBuffer(downloadResponse.readableStreamBody);
        fs.writeFileSync(tmpVideoPath, videoStream);

        // Step 2: Process the video - generate a thumbnail
        await generateThumbnail(tmpVideoPath, tmpThumbnailPath);

        // Step 3: Transcode the video to HLS format
        const tmpHlsPath = `/tmp/${videoFileName.split('.')[0]}.m3u8`;
        await transcodeVideo(tmpVideoPath, tmpHlsPath, 'hls');

        // Step 4: Upload the thumbnail to Azure Blob Storage
        const thumbnailBlobClient = containerClient.getBlockBlobClient(`thumbnails/${videoFileName.split('.')[0]}-thumbnail.jpg`);
        const thumbnailData = fs.readFileSync(tmpThumbnailPath);
        await thumbnailBlobClient.upload(thumbnailData, thumbnailData.length);

        // Step 5: Upload the HLS video segments to Azure Blob Storage
        const hlsBlobClient = containerClient.getBlockBlobClient(`videos/${videoFileName.split('.')[0]}.m3u8`);
        const hlsData = fs.readFileSync(tmpHlsPath);
        await hlsBlobClient.upload(hlsData, hlsData.length);

        // Step 6: Respond with success
        context.res = {
            status: 200,
            body: 'Video processed and thumbnail generated at the edge in Azure',
        };
    } catch (error) {
        context.log('Error processing video at Azure Edge:', error);
        context.res = {
            status: 500,
            body: `Error processing video: ${error.message}`,
        };
    }
};
