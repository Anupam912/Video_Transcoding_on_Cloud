// serverless/aws/transcodeVideo.js
const AWS = require('aws-sdk');
const elasticTranscoder = new AWS.ElasticTranscoder();

exports.handler = async (event) => {
    const { fileName, quality } = JSON.parse(event.body);
    
    const params = {
        PipelineId: 'your-pipeline-id',
        Input: {
            Key: `uploads/${fileName}`,
        },
        OutputKeyPrefix: 'transcoded/',
        Outputs: [
            {
                Key: `transcoded/${fileName}-${quality}.mp4`,
                PresetId: quality === 'Low' ? '1351620000001-000010' : 
                           quality === 'Medium' ? '1351620000001-000020' : 
                           '1351620000001-000030', // AWS Preset IDs for quality
            },
        ],
    };

    try {
        const result = await elasticTranscoder.createJob(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Transcoding started', jobId: result.Job.Id }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Transcoding failed', error }),
        };
    }
};
