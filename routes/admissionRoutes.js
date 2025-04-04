import express from 'express';
import { getAdmissions, processAdmission } from '../controllers/admissionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.get('/', getAdmissions);
router.post('/', processAdmission);

export default router;