// serverless/aws/generateThumbnail.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { execSync } = require('child_process');
const fs = require('fs');

exports.handler = async (event) => {
    const { videoKey } = JSON.parse(event.body);
    
    const videoPath = `/tmp/${videoKey}`;
    const thumbnailPath = `/tmp/${videoKey}-thumbnail.jpg`;

    // Download video from S3
    const video = await s3.getObject({
        Bucket: 'your-video-bucket',
        Key: videoKey,
    }).promise();
    
    fs.writeFileSync(videoPath, video.Body);

    // Generate thumbnail using FFmpeg
    execSync(`ffmpeg -i ${videoPath} -ss 00:00:02.000 -vframes 1 ${thumbnailPath}`);

    // Upload thumbnail to S3
    const thumbnail = fs.readFileSync(thumbnailPath);
    await s3.putObject({
        Bucket: 'your-thumbnail-bucket',
        Key: `thumbnails/${videoKey}-thumbnail.jpg`,
        Body: thumbnail,
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Thumbnail generated' }),
    };
};
