// serverless/aws/uploadVideo.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

// Function to verify the JWT token from Cognito
async function verifyToken(token) {
    const jwks = await axios.get(
        `https://cognito-idp.us-west-2.amazonaws.com/YOUR_USER_POOL_ID/.well-known/jwks.json`
    );
    const decoded = jwt.decode(token, { complete: true });
    const pem = jwkToPem(jwks.data.keys.find((key) => key.kid === decoded.header.kid));
    return jwt.verify(token, pem, { algorithms: ['RS256'] });
}

exports.handler = async (event) => {
    const token = event.headers.Authorization.split(' ')[1];

    try {
        await verifyToken(token); // Verify the token
    } catch (err) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
        };
    }

    const { fileName, videoContent } = JSON.parse(event.body);

    // Upload video to S3
    const params = {
        Bucket: 'your-video-bucket',
        Key: `uploads/${fileName}`,
        Body: Buffer.from(videoContent, 'base64'),
    };

    try {
        await s3.upload(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Video uploaded successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Upload failed', error }),
        };
    }
};
