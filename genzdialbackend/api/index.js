// Vercel serverless entrypoint.
// All HTTP traffic is routed here by vercel.json and dispatched to the Express app.
const { app, bootstrap } = require('../server');

let ready = null;

module.exports = async (req, res) => {
    if (!ready) ready = bootstrap().catch((err) => {
        ready = null; // allow retry on next request if startup failed
        throw err;
    });
    try {
        await ready;
    } catch (err) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ error: 'Backend startup failed', message: err.message }));
        return;
    }
    return app(req, res);
};
