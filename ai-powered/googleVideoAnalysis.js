// ai-powered/googleVideoAnalysis.js
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');
const client = new VideoIntelligenceServiceClient();

exports.analyzeVideoGoogle = async (req, res) => {
    const { gcsUri } = req.body; // The video stored in Google Cloud Storage

    try {
        const request = {
            inputUri: gcsUri,
            features: ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION', 'SPEECH_TRANSCRIPTION'],
        };

        // Start video analysis with Google Video Intelligence API
        const [operation] = await client.annotateVideo(request);
        const [results] = await operation.promise();
        res.status(200).json({ message: 'Video analysis completed', results });
    } catch (error) {
        console.error('Error starting Google Cloud video analysis:', error);
        res.status(500).json({ error: 'Failed to start video analysis', details: error.message });
    }
};
