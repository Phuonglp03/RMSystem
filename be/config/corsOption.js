const whitelist = [
    'http://localhost:3000', // Frontend development
    'http://127.0.0.1:3000',
    process.env.CORS_ORIGIN, 
    'https://domain.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép requests không có origin (mobile apps, etc.)
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cache-Control', 
        'Pragma', 
        'Accept',
        'Accept-Encoding',
        'Accept-Language',
        'Connection',
        'Host',
        'Origin',
        'Referer',
        'User-Agent',
        'X-Requested-With'
    ],
    credentials: true, // Quan trọng: cho phép cookies và credentials
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false // Pass control to the next handler
};

module.exports = { corsOptions };
