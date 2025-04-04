import express from 'express';
import auth from '../middleware/auth.js';
import {generateReport} from '../controllers/reportController.js';

const router = express.Router();
router.use(auth);

router.post('/', generateReport);

export default router;