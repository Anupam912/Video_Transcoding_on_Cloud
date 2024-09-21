// edge-computing/lambdaEdgeProcessing.js
const { generateThumbnail, transcodeVideo } = require('./videoProcessing');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const uri = request.uri;
    const videoFileName = path.basename(uri);

    const tmpVideoPath = `/tmp/${videoFileName}`;
    const tmpThumbnailPath = `/tmp/${videoFileName.split('.')[0]}-thumbnail.jpg`;

    // Download video from S3
    const params = { Bucket: 'your-s3-bucket', Key: `videos/${videoFileName}` };
    const video = await s3.getObject(params).promise();
    fs.writeFileSync(tmpVideoPath, video.Body);

    // Process video: generate thumbnail
    await generateThumbnail(tmpVideoPath, tmpThumbnailPath);

    // Transcode video to HLS format
    const tmpHlsPath = `/tmp/${videoFileName.split('.')[0]}.m3u8`;
    await transcodeVideo(tmpVideoPath, tmpHlsPath, 'hls');

    // Upload thumbnail and HLS to S3
    const thumbnailData = fs.readFileSync(tmpThumbnailPath);
    await s3.putObject({ Bucket: 'your-s3-bucket', Key: `thumbnails/${videoFileName.split('.')[0]}-thumbnail.jpg`, Body: thumbnailData }).promise();

    const hlsData = fs.readFileSync(tmpHlsPath);
    await s3.putObject({ Bucket: 'your-s3-bucket', Key: `videos/${videoFileName.split('.')[0]}.m3u8`, Body: hlsData }).promise();

    return {
        status: '200',
        statusDescription: 'OK',
        body: 'Video processed and thumbnail generated at the edge',
    };
};
