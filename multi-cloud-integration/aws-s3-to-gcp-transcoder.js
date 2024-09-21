// multi-cloud-integration/aws-s3-to-gcp-transcoder.js
const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const { TranscoderServiceClient } = require('@google-cloud/video-transcoder');
const fs = require('fs');
const path = require('path');

// AWS S3 and Google Cloud setup
const s3 = new AWS.S3();
const gcsStorage = new Storage();
const transcoderClient = new TranscoderServiceClient();

// Helper function to download file from S3
async function downloadFromS3(bucketName, fileName, downloadPath) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };

    const data = await s3.getObject(params).promise();
    fs.writeFileSync(downloadPath, data.Body);
}

// Helper function to upload file to Google Cloud Storage
async function uploadToGCS(bucketName, filePath, destinationFileName) {
    const bucket = gcsStorage.bucket(bucketName);
    await bucket.upload(filePath, {
        destination: destinationFileName,
    });
}

// Helper function to trigger Google Cloud Transcoder API
async function triggerTranscoder(inputUri, outputUri, presetId) {
    const job = {
        inputUri,
        outputUri,
        config: {
            elementaryStreams: [
                {
                    key: 'video-stream0',
                    videoStream: {
                        codec: 'h264',
                        bitrateBps: 5500000,
                        frameRate: 30,
                        heightPixels: 1080,
                        widthPixels: 1920,
                    },
                },
            ],
            muxStreams: [
                {
                    key: 'sd',
                    container: 'mp4',
                    elementaryStreams: ['video-stream0'],
                },
            ],
        },
    };

    const [operation] = await transcoderClient.createJob({
        parent: transcoderClient.locationPath('your-project-id', 'us-central1'),
        job,
    });

    return operation;
}

// Main handler for the multi-cloud transfer and transcoding
exports.awsS3ToGCPTranscode = async (req, res) => {
    const { s3Bucket, s3File, gcsBucket, outputFolder, presetId } = req.body;

    const downloadPath = path.join('/tmp', s3File);

    try {
        // Step 1: Download file from AWS S3
        await downloadFromS3(s3Bucket, s3File, downloadPath);

        // Step 2: Upload file to Google Cloud Storage
        await uploadToGCS(gcsBucket, downloadPath, s3File);

        // Step 3: Trigger Google Cloud Transcoder API
        const inputUri = `gs://${gcsBucket}/${s3File}`;
        const outputUri = `gs://${gcsBucket}/${outputFolder}/`;
        const operation = await triggerTranscoder(inputUri, outputUri, presetId);

        res.status(200).json({
            message: 'Video transferred from AWS S3 to Google Cloud and transcoding started',
            jobId: operation.name,
        });
    } catch (error) {
        console.error('Error in AWS S3 to Google Cloud Transcoder flow:', error);
        res.status(500).json({ error: 'Failed to transfer and transcode video', details: error.message });
    }
};
