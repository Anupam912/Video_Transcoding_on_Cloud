// serverless/aws/analyzeVideo.js
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

exports.handler = async (event) => {
    const { videoKey } = JSON.parse(event.body);

    const params = {
        Video: {
            S3Object: {
                Bucket: 'your-video-bucket',
                Name: videoKey,
            },
        },
        NotificationChannel: {
            SNSTopicArn: 'your-sns-topic-arn', // SNS Topic for results
            RoleArn: 'your-iam-role-arn',
        },
    };

    try {
        const result = await rekognition.startContentModeration(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Video analysis started', jobId: result.JobId }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Video analysis failed', error }),
        };
    }
};
