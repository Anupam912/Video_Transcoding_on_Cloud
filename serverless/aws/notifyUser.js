// serverless/aws/notifyUser.js
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

exports.handler = async (event) => {
    const { email, message } = JSON.parse(event.body);

    const params = {
        Message: message,
        Subject: 'Video Processing Update',
        TopicArn: 'your-sns-topic-arn',
        MessageAttributes: {
            'email': {
                DataType: 'String',
                StringValue: email,
            },
        },
    };

    try {
        await sns.publish(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Notification sent successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send notification', error }),
        };
    }
};
