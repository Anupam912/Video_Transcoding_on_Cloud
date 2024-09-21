// /frontend/components/VideoPlayer.js
import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
    return (
        <div className="video-player-container">
            <h3>Your Transcoded Video:</h3>
            <video controls width="600">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
