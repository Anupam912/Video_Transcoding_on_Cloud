// /frontend/components/Signup.js
import React, { useState } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-west-2_XXXXXXXXX', // Your User Pool ID
    ClientId: 'XXXXXXXXXXXXXXXXXXXXX' // Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState('');

    const handleSignup = (e) => {
        e.preventDefault();
        userPool.signUp(email, password, [], null, (err, result) => {
            if (err) {
                setConfirmationMessage('Error: ' + err.message);
            } else {
                setConfirmationMessage('Sign-up successful! Please check your email to confirm your account.');
            }
        });
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
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
                <button type="submit">Sign Up</button>
            </form>
            {confirmationMessage && <p>{confirmationMessage}</p>}
        </div>
    );
};

export default Signup;
