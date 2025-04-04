import express from 'express';
import auth from '../middleware/auth.js';
import { getResults, uploadResults } from '../controllers/resultController.js';

const router = express.Router();
router.use(auth);

router.get('/', getResults);
router.post('/', uploadResults);

export default router;