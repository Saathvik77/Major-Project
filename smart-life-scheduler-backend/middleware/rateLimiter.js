
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,
    handler: (req, res, next, options) => {
        console.warn(`⚠️ Rate Limit Exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

module.exports = limiter;