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
  'https://your-deployed-app.com', // Production
  undefined
];

app.use(cors({
  origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          console.log(`Blocked request from origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// app.use(cors({
//   origin: "*",
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));


app.use(express.json());

let mongo = null;
// Database connection
(async () => {
  mongo = await connectDB();
  console.log("✅ MongoDB Connection Established");
})();

const requestLogger = (req, res, next) => {
  // const originalSend = res.send; // Store the original send method

  // res.send = function (body) {
  //     try {
  //         let parsedBody = JSON.parse(body); // Convert response body to object (if string)

  //         // Restrict inner array in response body to 10 items
  //         if (parsedBody && typeof parsedBody === "object") {
  //             for (const key in parsedBody) {
  //                 if (Array.isArray(parsedBody[key]) && parsedBody[key].length > 10) {
  //                     parsedBody[key] = parsedBody[key].slice(0, 10); // Keep only first 10 items
  //                 }
  //             }
  //         }

  //         console.log(
  //             `📌 [${new Date().toISOString()}] Got Response having code ${
  //                 res.statusCode
  //             } with data: ${JSON.stringify(parsedBody, null, 2)}`
  //         );

  //     } catch (error) {
  //         console.error("Error parsing response body:", error);
  //     }

  //     return originalSend.call(this, body); // Send the original response
  // };

  // Restrict `req.body` logging to 5 items only
  let loggedBody = req.body;
  // if (typeof loggedBody === "object") {
  //     for (const key in loggedBody) {
  //         if (Array.isArray(loggedBody[key]) && loggedBody[key].length > 5) {
  //             loggedBody[key] = loggedBody[key].slice(0, 5); // Keep only first 5 items
  //         }
  //     }
  // }

  console.log(`📌 [${new Date().toISOString()}] Requested URL: ${req.method} ${req.originalUrl}`);
  console.log(`📌 [${new Date().toISOString()}] Requested Body: ${JSON.stringify(loggedBody, null, 2)}`);

  next(); // Move to the next middleware or route handler
};

app.use(requestLogger)

// Routes
app.get('/', (req,res)=>{
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