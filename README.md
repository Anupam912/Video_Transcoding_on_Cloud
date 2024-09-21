# Video Transcoding Service

## Project Overview

The Video Transcoding Service is a cloud-agnostic serverless application that provides a fully automated solution for video uploading, transcoding, and delivery. The project is designed to work across multiple cloud providers (AWS, Google Cloud, and Azure) and integrates powerful AI features such as video content analysis, real-time analytics, and disaster recovery. It supports various video formats and allows users to upload videos, select quality preferences, and process the videos accordingly. The system also provides real-time feedback, monitoring, and advanced disaster recovery mechanisms.

## Key Features

- Multi-cloud Support: Supports video transcoding on AWS, Google Cloud, and Azure.
- AI-Powered Video Analysis: Integrates with cloud AI services like AWS Rekognition, Google Cloud Video Intelligence, and Azure Video Indexer to analyze video content.
- Real-Time Analytics: Streams and processes analytics for video usage and processing across multiple clouds.
- Disaster Recovery: Provides automatic backups and failover strategies across multiple cloud environments.
- Edge Computing: Reduces latency by utilizing edge computing capabilities, including AWS Lambda@Edge, Google Cloud Functions, and Azure Edge Zones.
- Serverless Architecture: Fully serverless with deployment options for AWS Lambda, Google Cloud Functions, and Azure Functions.

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- AWS CLI, Google Cloud SDK, and Azure CLI installed
- Accounts for AWS, Google Cloud, and Azure
- A code repository on GitHub (or similar service) for CI/CD pipelines

```bash
git clone https://github.com/yourusername/video-transcoding-service.git
cd video-transcoding-service
npm install
```

#### Install AWS CLI and configure

```bash
aws configure
npm install -g serverless
serverless deploy --stage dev
```

#### Install Google Cloud SDK and deploy Google Cloud Functions

```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
gcloud functions deploy video-transcoding-service --runtime nodejs14 --trigger-http --region=us-central1
```

#### Install Azure CLI and deploy Azure Functions

```bash
az login
az functionapp create --name video-transcoding-service --storage-account [YOUR_STORAGE_ACCOUNT] --consumption-plan-location [LOCATION] --resource-group [RESOURCE_GROUP] --runtime node
```

### Configurations

#### AWS

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- S3_BUCKET_NAME

#### Google Cloud

- GOOGLE_APPLICATION_CREDENTIALS: Path to the service account JSON key file
- GCP_PROJECT_ID
- GCS_BUCKET_NAME

#### Azure

- AZURE_SUBSCRIPTION_ID
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET
- AZURE_TENANT_ID
- AZURE_STORAGE_ACCOUNT

### AI Service Configuration

- AWS Rekognition: No additional setup required as long as AWS credentials are set.

- Google Cloud Video Intelligence:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-keyfile.json
```

- Azure Video Indexer: Set up [AZURE_VIDEO_INDEXER_API_KEY], [AZURE_VIDEO_INDEXER_REGION], and [AZURE_VIDEO_INDEXER_ACCOUNT_ID] in environment variables.

## CI/CD Integration

The project is configured for multi-cloud CI/CD with GitHub Actions, AWS CodePipeline, Google Cloud Build, and Azure Pipelines. Each platform has a pipeline configuration file in the [/ci-cd/] folder.

### GitHub Action

- The pipeline is defined in the ci-cd/github-actions.yml file.
- Set up secrets for AWS, Google Cloud, and Azure in the GitHub repository under [Settings > Secrets].

### AWS CodePipeline

- The pipeline configuration is in ci-cd/aws-codepipeline.yml.
- Deploy this CloudFormation template to set up the pipeline in AWS.

### Google Cloud Build

- The build and deployment steps are configured in ci-cd/google-cloudbuild.yaml.

### Azure Pipelines

- The CI/CD pipeline for Azure is configured in ci-cd/azure-pipelines.yml.
