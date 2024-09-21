// ai-powered/awsVideoAnalysis.js
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

exports.analyzeVideoAWS = async (req, res) => {
    const { bucket, key } = req.body; // The video stored in AWS S3

    try {
        const params = {
            Video: {
                S3Object: {
                    Bucket: bucket,
                    Name: key,
                },
            },
            NotificationChannel: {
                SNSTopicArn: 'your-sns-topic-arn', // SNS topic for result notifications
                RoleArn: 'your-iam-role',
            },
        };

        // Start video analysis with Rekognition
        const response = await rekognition.startLabelDetection(params).promise();
        res.status(200).json({ message: 'Video analysis started', jobId: response.JobId });
    } catch (error) {
        console.error('Error starting AWS Rekognition video analysis:', error);
        res.status(500).json({ error: 'Failed to start video analysis', details: error.message });
    }
};
