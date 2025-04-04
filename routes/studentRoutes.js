import express from 'express';
import { upload } from '../config/uploadImageConfig.js';
import studentController from '../controllers/studentController.js';
import auth from '../middleware/auth.js';
import { validateObjectId } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(auth);

router.get('/get', studentController.getStudents);
router.get('/:id', validateObjectId('id'),studentController.getStudentDetails);
router.post('/create', upload.single('profileImage'), studentController.addStudent);
router.post('/update/:id', validateObjectId('id'), studentController.updateStudent);
router.delete('/delete/:id', validateObjectId('id'), studentController.deleteStudent);
router.post('/changeSection/:id', validateObjectId('id'), studentController.changeStudentSection);
router.post('/import', upload.single('file'), studentController.importExcel);

export default router;
