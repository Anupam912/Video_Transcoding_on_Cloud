// serverless/google-cloud/cloudStorage.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

exports.manageGCSFiles = async (req, res) => {
    const bucketName = 'your-video-bucket';
    const { fileName, action } = req.body; // Action could be 'delete', 'metadata', etc.

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    try {
        if (action === 'delete') {
            await file.delete();
            res.status(200).json({ message: `File ${fileName} deleted successfully.` });
        } else if (action === 'metadata') {
            const [metadata] = await file.getMetadata();
            res.status(200).json(metadata);
        } else {
            res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error managing file in GCS:', error);
        res.status(500).json({ error: `Failed to perform ${action} on file`, details: error.message });
    }
};
