// /frontend/components/Login.js
import React, { useState } from 'react';
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool
} from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-west-2_XXXXXXXXX', // Your User Pool ID
    ClientId: 'XXXXXXXXXXXXXXXXXXXXX' // Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        const user = new CognitoUser({
            Username: email,
            Pool: userPool
        });

        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        });

        user.authenticateUser(authDetails, {
            onSuccess: (session) => {
                const idToken = session.getIdToken().getJwtToken();
                onLogin(idToken);
                setErrorMessage('Login successful!');
            },
            onFailure: (err) => {
                setErrorMessage('Error: ' + err.message);
            }
        });
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
};

export default Login;
