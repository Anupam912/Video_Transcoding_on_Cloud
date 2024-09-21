// /frontend/components/Logout.js
import React from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-west-2_XXXXXXXXX', // Your User Pool ID
    ClientId: 'XXXXXXXXXXXXXXXXXXXXX' // Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

const Logout = ({ onLogout }) => {
    const handleLogout = () => {
        const user = userPool.getCurrentUser();
        if (user) {
            user.signOut();
            onLogout();
        }
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default Logout;
