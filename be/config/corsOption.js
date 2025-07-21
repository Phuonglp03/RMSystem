const whitelist = [
    // Development URLs
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL,
    
    // Production URLs
    'https://www.rmsystem.store',
    'https://rmsystem.store',
    'https://rm-system-beta.vercel.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);
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
