// event-driven/eventDispatcher.js
const AWS = require('aws-sdk');
const { EventGridPublisherClient, AzureKeyCredential } = require('@azure/eventgrid');
const { PubSub } = require('@google-cloud/pubsub');

// AWS EventBridge setup
const eventBridge = new AWS.EventBridge();
// Azure Event Grid setup
const eventGridClient = new EventGridPublisherClient(process.env.AZURE_EVENT_GRID_ENDPOINT, new AzureKeyCredential(process.env.AZURE_EVENT_GRID_KEY));
// Google Pub/Sub setup
const pubsub = new PubSub();

exports.dispatchEvent = async function (req, res) {
    const { provider, eventType, eventDetails } = req.body;

    try {
        if (provider === 'aws') {
            // Dispatch event to AWS EventBridge
            const params = {
                Entries: [
                    {
                        Source: 'com.video.transcoding',
                        DetailType: eventType,
                        Detail: JSON.stringify(eventDetails),
                        EventBusName: 'default',
                    },
                ],
            };

            const result = await eventBridge.putEvents(params).promise();
            res.status(200).json({ message: 'Event dispatched to AWS EventBridge', result });
        } else if (provider === 'azure') {
            // Dispatch event to Azure Event Grid
            const events = [
                {
                    eventType,
                    subject: 'video/upload',
                    data: eventDetails,
                    eventTime: new Date().toISOString(),
                    dataVersion: '1.0',
                },
            ];

            await eventGridClient.send(events);
            res.status(200).json({ message: 'Event dispatched to Azure Event Grid' });
        } else if (provider === 'gcs') {
            // Dispatch event to Google Cloud Pub/Sub
            const topicName = 'projects/your-gcp-project-id/topics/your-topic-name';
            const messageBuffer = Buffer.from(JSON.stringify(eventDetails));

            await pubsub.topic(topicName).publish(messageBuffer);
            res.status(200).json({ message: 'Event dispatched to Google Cloud Pub/Sub' });
        } else {
            res.status(400).json({ error: 'Invalid provider' });
        }
    } catch (error) {
        console.error('Error dispatching event:', error);
        res.status(500).json({ error: 'Failed to dispatch event', details: error.message });
    }
};
