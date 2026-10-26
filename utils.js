const { OAuth2Client } = require('google-auth-library');
const { googleClientId } = require('./config');


const verifyToken = async (token) => {

    const client = new OAuth2Client(googleClientId);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();
        console.log('User verified:', payload.email);
        return payload;
    } catch (error) {
        console.error('Invalid token:', error.message);
        return null;
    }
}

module.exports = { verifyToken };