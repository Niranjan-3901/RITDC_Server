import express from 'express';
import { addNewSectionInAClass, createClasses, deleteClasses, getClasses, getClassAndSections,getClassesById, updateClasses } from '../controllers/classController.js';
import { deleteSection, getAllSections, getSectionById, getSectionsByClassId, switchSectionClass, updateSectionName } from '../controllers/sectionController.js';
import auth from '../middleware/auth.js';
import { validateObjectId } from "../middleware/errorHandler.js";

const router = express.Router();

router.use(auth);

router.get('/get', getClasses);
router.get('/getbyid/:id', validateObjectId('id'), getClassesById);
router.post('/create', createClasses);
router.post('/update/:id', validateObjectId('id'), updateClasses);
router.delete('/delete/:id', validateObjectId('id'), deleteClasses);
router.post('/add-section/:id', validateObjectId('id'), addNewSectionInAClass);
router.get('/getClassAndSections', getClassAndSections);

// Section Routes
const SectionRoutes = express.Router();

SectionRoutes.get('/get-all-sections',getAllSections);
SectionRoutes.get('/:classId/get-class-sections',validateObjectId("classId"),getSectionsByClassId);
SectionRoutes.get('/getbyid/:id', validateObjectId("id"), getSectionById);
SectionRoutes.post('/switchSectionClass/:id', validateObjectId('id'), switchSectionClass);
SectionRoutes.post('/updateSectionName/:id', validateObjectId('id'), updateSectionName);
SectionRoutes.delete('/delete/:id', validateObjectId('id'), deleteSection);

router.use('/sections', SectionRoutes);

export default router;
