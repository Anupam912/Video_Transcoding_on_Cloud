// serverless/aws/verifyToken.js
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');

exports.handler = async (event) => {
    const token = event.headers.Authorization.split(' ')[1];

    try {
        const jwks = await axios.get(
            `https://cognito-idp.us-west-2.amazonaws.com/YOUR_USER_POOL_ID/.well-known/jwks.json`
        );

        const decoded = jwt.decode(token, { complete: true });
        const pem = jwkToPem(jwks.data.keys.find((key) => key.kid === decoded.header.kid));
        
        jwt.verify(token, pem, { algorithms: ['RS256'] });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Token is valid' }),
        };
    } catch (err) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
        };
    }
};
