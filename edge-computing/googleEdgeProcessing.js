// edge-computing/googleEdgeProcessing.js
const { generateThumbnail, transcodeVideo } = require('./videoProcessing');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const storage = new Storage();

exports.googleEdgeProcessing = async (req, res) => {
    const videoFileName = path.basename(req.originalUrl);

    const tmpVideoPath = `/tmp/${videoFileName}`;
    const tmpThumbnailPath = `/tmp/${videoFileName.split('.')[0]}-thumbnail.jpg`;

    // Download video from Google Cloud Storage
    const bucket = storage.bucket('your-gcs-bucket');
    const file = bucket.file(`videos/${videoFileName}`);
    const [video] = await file.download();
    fs.writeFileSync(tmpVideoPath, video);

    // Process video: generate thumbnail
    await generateThumbnail(tmpVideoPath, tmpThumbnailPath);

    // Transcode video to HLS format
    const tmpHlsPath = `/tmp/${videoFileName.split('.')[0]}.m3u8`;
    await transcodeVideo(tmpVideoPath, tmpHlsPath, 'hls');

    // Upload thumbnail and HLS to Google Cloud Storage
    await bucket.upload(tmpThumbnailPath, { destination: `thumbnails/${videoFileName.split('.')[0]}-thumbnail.jpg` });
    await bucket.upload(tmpHlsPath, { destination: `videos/${videoFileName.split('.')[0]}.m3u8` });

    res.status(200).send('Video processed and thumbnail generated at the edge');
};
