import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
    'http://localhost:3000',  // Web Frontend
    'http://192.168.1.5:19000', // Expo Debug Mode
    'http://192.168.1.5:5000', // Mobile API Requests (Expo)
    'https://your-deployed-app.com' // Production
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
// app.use(cors(
//     // { origin: 'http://10.81.23.22:8081',
//     //     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     //     credentials: true,
//     //     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
//     //     allowedHeaders: ['Content-Type', 'Authorization']
//     // }
// ));
app.use(express.json());

// Database connection
connectDB();

const requestLogger = (req, res, next) => {
    console.log(`📌 [${new Date().toISOString()}] Requested URL: ${req.method} ${req.originalUrl}`);
    next(); // Move to the next middleware or route handler
};

app.use(requestLogger)

// Routes
app.get('/', ()=>{
    res.send('Welcome to the RITDC Attendance and Result Management System');
    console.log("Server is listening for incoming requests")
})
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/class', classRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));    