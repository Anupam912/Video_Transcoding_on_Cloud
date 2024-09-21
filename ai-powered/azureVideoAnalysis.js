// ai-powered/azureVideoAnalysis.js
const { VideoIndexer } = require('@azure/cognitiveservices-videoindexer');
const azureIndexerClient = new VideoIndexer({
    apiKey: process.env.AZURE_VIDEO_INDEXER_API_KEY,
    region: process.env.AZURE_VIDEO_INDEXER_REGION,
    accountId: process.env.AZURE_VIDEO_INDEXER_ACCOUNT_ID,
});

exports.analyzeVideoAzure = async (req, res) => {
    const { videoUrl } = req.body; // The video URL

    try {
        // Start video analysis with Azure Video Indexer
        const response = await azureIndexerClient.videos.create({
            url: videoUrl,
            privacy: 'private',
            callbackUrl: 'your-callback-url', // Optional callback URL for analysis results
        });

        res.status(200).json({ message: 'Video analysis started with Azure Video Indexer', response });
    } catch (error) {
        console.error('Error starting Azure video analysis:', error);
        res.status(500).json({ error: 'Failed to start video analysis', details: error.message });
    }
};
