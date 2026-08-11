const admin = require('firebase-admin');

if (!admin.getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
        credential: admin.cert(serviceAccount),
    });
}

module.exports = admin;