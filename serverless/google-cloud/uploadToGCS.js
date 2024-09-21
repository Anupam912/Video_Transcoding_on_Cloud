// serverless/google-cloud/uploadToGCS.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

exports.uploadToGCS = async (req, res) => {
    const bucketName = 'your-video-bucket';
    const { fileName, fileContent } = req.body;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(`uploads/${fileName}`);

    try {
        await file.save(Buffer.from(fileContent, 'base64'), { resumable: false });
        res.status(200).json({ message: 'Video uploaded to GCS successfully' });
    } catch (error) {
        console.error('Error uploading to GCS:', error);
        res.status(500).json({ error: 'Failed to upload to GCS', details: error.message });
    }
};
