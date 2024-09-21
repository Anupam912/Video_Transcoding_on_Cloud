// ai-powered/videoAnalysis.js
const AWS = require('aws-sdk');
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');
const { VideoIndexer } = require('@azure/cognitiveservices-videoindexer');
const axios = require('axios');

// AWS Rekognition setup
const rekognition = new AWS.Rekognition();

// Google Cloud Video Intelligence setup
const googleVideoClient = new VideoIntelligenceServiceClient();

// Azure Video Indexer setup
const azureIndexerClient = new VideoIndexer({
    apiKey: process.env.AZURE_VIDEO_INDEXER_API_KEY,
    region: process.env.AZURE_VIDEO_INDEXER_REGION,
    accountId: process.env.AZURE_VIDEO_INDEXER_ACCOUNT_ID,
});

// Helper function for AWS Rekognition video analysis
async function analyzeVideoAWS(s3Bucket, s3VideoKey) {
    const params = {
        Video: {
            S3Object: { Bucket: s3Bucket, Name: s3VideoKey },
        },
        NotificationChannel: {
            SNSTopicArn: 'your-sns-topic-arn', // SNS topic for result notifications
            RoleArn: 'your-iam-role',
        },
    };
    const response = await rekognition.startLabelDetection(params).promise();
    return response.JobId;
}

// Helper function for Google Cloud Video Intelligence API
async function analyzeVideoGoogle(gcsUri) {
    const request = {
        inputUri: gcsUri,
        features: ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION', 'SPEECH_TRANSCRIPTION'],
    };
    const [operation] = await googleVideoClient.annotateVideo(request);
    const [results] = await operation.promise();
    return results;
}

// Helper function for Azure Video Indexer
async function analyzeVideoAzure(videoUrl) {
    const response = await azureIndexerClient.videos.create({
        url: videoUrl,
        privacy: 'private',
        callbackUrl: 'your-callback-url',
    });
    return response;
}

// Main function to analyze video using the chosen provider
exports.analyzeVideo = async (req, res) => {
    const { provider, videoUri, bucket, key } = req.body; // `provider` can be 'aws', 'gcs', or 'azure'

    try {
        let result;
        if (provider === 'aws') {
            result = await analyzeVideoAWS(bucket, key);
        } else if (provider === 'gcs') {
            result = await analyzeVideoGoogle(videoUri);
        } else if (provider === 'azure') {
            result = await analyzeVideoAzure(videoUri);
        } else {
            throw new Error('Invalid provider');
        }

        res.status(200).json({ message: 'Video analysis started successfully', result });
    } catch (error) {
        console.error('Error starting video analysis:', error);
        res.status(500).json({ error: 'Failed to analyze video', details: error.message });
    }
};
