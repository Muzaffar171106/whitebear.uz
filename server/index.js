import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import adminRoutes from './api/routes/admin-route.js';
import blogRoutes from './api/routes/blog-route.js';
import contactRoutes from './api/routes/contact-route.js';
import productRoutes from './api/routes/product-route.js';
import orderRoutes from './api/routes/order-route.js';
import categoryRoutes from './api/routes/category-route.js';
dotenv.config();
const dnsServers = process.env.DNS_SERVERS ? process.env.DNS_SERVERS.split(',') : ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

const app = express();
const cachePublicGet = (seconds) => (req, res, next) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`);
    }
    next();
};
const allowedOrigins = process.env.CLIENT_ORIGINS
    ?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use("/api/uploads", express.static("uploads", {
    etag: true,
    immutable: true,
    maxAge: '1y'
}));

const PORT = process.env.PORT || 3000;
const MongoURI = process.env.DB_URL || 'mongodb://localhost:27017/whitebear';
// console.log(MongoURI);

app.get('/', (_, res) => {
    res.send('Server is running');
});
app.use('/api/admin', adminRoutes)
app.use('/api/blog', cachePublicGet(300), blogRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/product', cachePublicGet(60), productRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/category', cachePublicGet(600), categoryRoutes)
app.use('/api', (_, res) => {
    res.status(404).json({ message: 'API route not found' });
});
app.use((error, _, res, next) => {
    if (res.headersSent) return next(error);
    res.status(error.status || 500).json({
        message: error.status ? error.message : 'Internal server error'
    });
});
mongoose.connect(MongoURI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    family: 4
})
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch(err => {
        console.error('❌ Ulanishda hali ham xato bor:');
        console.error('Xato kodi:', err.code);
        console.error('Xato matni:', err);
    });

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

