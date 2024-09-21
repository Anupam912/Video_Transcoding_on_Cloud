// edge-computing/videoProcessing.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to generate a video thumbnail using FFmpeg
async function generateThumbnail(videoPath, thumbnailPath) {
    try {
        const command = `ffmpeg -i ${videoPath} -ss 00:00:01.000 -vframes 1 ${thumbnailPath}`;
        execSync(command);
        return thumbnailPath;
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw error;
    }
}

// Helper function to transcode a video using FFmpeg
async function transcodeVideo(inputPath, outputPath, format = 'hls') {
    try {
        let command;
        if (format === 'hls') {
            command = `ffmpeg -i ${inputPath} -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputPath}`;
        } else {
            command = `ffmpeg -i ${inputPath} ${outputPath}`;
        }
        execSync(command);
        return outputPath;
    } catch (error) {
        console.error('Error transcoding video:', error);
        throw error;
    }
}

module.exports = {
    generateThumbnail,
    transcodeVideo,
};
