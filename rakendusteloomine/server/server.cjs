const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
const { connectToDatabase } = require('./connect.cjs');
const tmdbRoutes = require('./tmdbRoutes.cjs');

console.log('Environment variables loaded:');
console.log('ATLAS_URI:', process.env.ATLAS_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('TMDB_API_KEY:', process.env.TMDB_API_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


app.use(cors());
app.use(express.json());
app.use('/api', tmdbRoutes);


let db;
connectToDatabase().then(database => {
    db = database;
    console.log('Database connected in server');
}).catch(err => {
    console.error('Failed to connect to database:', err.message);
    console.log('Server will continue running without database connection.');
});


app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        
        if (!username || !password) {
            return res.status(400).json({ message: 'Kasutajanimi ja parool on kohustuslikud' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Parool peab olema vähemalt 6 märki pikk' });
        }

        
        const existingUser = await db.collection('users').findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Kasutajanimi on juba kasutusel' });
        }

        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        
        const newUser = {
            username,
            password: hashedPassword,
            createdAt: new Date(),
            likedMovies: [],
            dislikedMovies: [],
            watchlist: []
        };

        await db.collection('users').insertOne(newUser);

        res.status(201).json({ message: 'Registreerimine õnnestus!' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Serveri viga' });
    }
});


app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        
        if (!username || !password) {
            return res.status(400).json({ message: 'Kasutajanimi ja parool on kohustuslikud' });
        }

        
        const user = await db.collection('users').findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Vale kasutajanimi või parool' });
        }

        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Vale kasutajanimi või parool' });
        }

        
        const token = jwt.sign(
            { userId: user._id.toString(), username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Sisselogimine õnnestus!',
            token,
            user: { username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Serveri viga' });
    }
});


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Autentimine ebaõnnestus' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token on kehtetu' });
        }
        req.user = user;
        next();
    });
};


app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'Kasutajat ei leitud' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Serveri viga' });
    }
});

app.put('/api/auth/preferences', authenticateToken, async (req, res) => {
    try {
        const { likedMovies, dislikedMovies, watchlist } = req.body;

        if (!Array.isArray(likedMovies) || !Array.isArray(dislikedMovies) || !Array.isArray(watchlist)) {
            return res.status(400).json({ message: 'Preferences peavad olema massiivid' });
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.userId) },
            { $set: { likedMovies, dislikedMovies, watchlist } }
        );

        res.json({ message: 'Eelistused salvestatud' });
    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(500).json({ message: 'Serveri viga' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});