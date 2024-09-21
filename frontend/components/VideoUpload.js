import React, { useState } from 'react';
import axios from 'axios';

const VideoUpload = ({ token }) => {
    const [file, setFile] = useState(null);
    const [quality, setQuality] = useState('Medium');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [responseMessage, setResponseMessage] = useState('');

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle video upload
    const handleUpload = async () => {
        if (!file) {
            setResponseMessage('Please select a video file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('quality', quality);

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });
            setResponseMessage('Upload successful!');
        } catch (error) {
            setResponseMessage('Upload failed. Please try again.');
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload Your Video</h2>
            <input type="file" onChange={handleFileChange} accept="video/*" />
            <label htmlFor="quality">Choose Quality:</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
            <button onClick={handleUpload} className="upload-button">
                Upload Video
            </button>

            {uploadProgress > 0 && (
                <div className="progress-bar">
                    <p>Upload Progress: {uploadProgress}%</p>
                </div>
            )}
            {responseMessage && <p className="response-message">{responseMessage}</p>}
        </div>
    );
};

export default VideoUpload;
