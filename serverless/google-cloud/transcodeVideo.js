// serverless/google-cloud/transcodeVideo.js
const { TranscoderServiceClient } = require('@google-cloud/video-transcoder');
const client = new TranscoderServiceClient();

exports.transcodeVideo = async (req, res) => {
    const { inputUri, outputUri, presetId } = req.body;

    const job = {
        inputUri: inputUri, // e.g., 'gs://your-bucket/your-video.mp4'
        outputUri: outputUri, // e.g., 'gs://your-output-bucket/'
        config: {
            elementaryStreams: [
                {
                    key: 'video-stream0',
                    videoStream: {
                        codec: 'h264',
                        bitrateBps: 5500000,
                        frameRate: 30,
                        heightPixels: 1080,
                        widthPixels: 1920,
                    },
                },
            ],
            muxStreams: [
                {
                    key: 'sd',
                    container: 'mp4',
                    elementaryStreams: ['video-stream0'],
                },
            ],
        },
    };

    try {
        const [operation] = await client.createJob({
            parent: client.locationPath('your-project-id', 'us-central1'),
            job,
        });
        res.status(200).json({ jobId: operation.name, message: 'Transcoding started successfully' });
    } catch (error) {
        console.error('Error creating transcoding job:', error);
        res.status(500).json({ error: 'Transcoding failed', details: error.message });
    }
};
