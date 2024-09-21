// /frontend/pages/index.js
import React, { useState } from 'react';
import Signup from '../components/Signup';
import Login from '../components/Login';
import Logout from '../components/Logout';
import VideoUpload from '../components/VideoUpload';

const HomePage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState('');

    const handleLogin = (jwtToken) => {
        setIsAuthenticated(true);
        setToken(jwtToken);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setToken('');
    };

    return (
        <div>
            <h1>Video Transcoding Service</h1>
            {!isAuthenticated ? (
                <>
                    <Signup />
                    <Login onLogin={handleLogin} />
                </>
            ) : (
                <>
                    <Logout onLogout={handleLogout} />
                    <VideoUpload token={token} />
                </>
            )}
        </div>
    );
};

export default HomePage;
