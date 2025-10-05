import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  downloadDocument,
  askQuestion,
} from '../controllers/documentController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.delete('/:id', protect, deleteDocument);
router.get('/:id/download', protect, downloadDocument);
router.post('/:id/question', protect, askQuestion);

export default router;