import { Request, Response, Router } from 'express';
import multer from 'multer';
import { AuthenticatedRequest, authMiddleware } from '../authMiddleware.ts';
import { dbService } from '../db.ts';
import { PdfMaterial } from '../types.ts';

const router = Router();

// Memory storage for PDF uploads up to 30MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

// GET /api/materials - List PDF materials for all students
router.get('/', (req: Request, res: Response) => {
  try {
    const { section, subject } = req.query;
    const materials = dbService.getPdfMaterials({
      section: section ? String(section) : undefined,
      subject: subject ? String(subject) : undefined,
    });
    return res.json({ success: true, materials });
  } catch (error) {
    console.error('[Materials] Error fetching materials:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve PDF materials.' });
  }
});

// GET /api/materials/:id - Single PDF material
router.get('/:id', (req: Request, res: Response) => {
  const material = dbService.getPdfMaterialById(req.params.id);
  if (!material) {
    return res.status(404).json({ success: false, message: 'PDF material not found.' });
  }
  return res.json({ success: true, material });
});

// POST /api/materials - Admin only: Add new PDF note or question paper via multipart FormData or JSON
router.post('/', authMiddleware, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only administrator accounts can upload and attach PDF notes or question papers.',
      });
    }

    let {
      title,
      section,
      subject,
      chapterTitle,
      year,
      description,
      fileUrl,
      fileName,
      fileSize,
    } = req.body;

    // If file was uploaded via multipart/form-data
    if (req.file) {
      fileName = req.file.originalname;
      const mb = req.file.size / (1024 * 1024);
      fileSize = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(req.file.size / 1024)} KB`;
      fileUrl = `data:${req.file.mimetype || 'application/pdf'};base64,${req.file.buffer.toString('base64')}`;

      if (!title || !title.trim()) {
        title = req.file.originalname.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
      }
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Material title is required.' });
    }
    if (!section) {
      return res.status(400).json({ success: false, message: 'Please select a target section for this PDF.' });
    }
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Please select a subject.' });
    }
    if (!fileUrl || !fileUrl.trim()) {
      return res.status(400).json({ success: false, message: 'PDF document file is required.' });
    }

    const newMaterial = dbService.addPdfMaterial({
      title: title.trim(),
      section,
      subject,
      chapterTitle: chapterTitle ? chapterTitle.trim() : undefined,
      year: year ? Number(year) : undefined,
      description: description ? description.trim() : '',
      fileUrl: fileUrl.trim(),
      fileName: fileName ? fileName.trim() : `${title.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: fileSize || 'PDF Document',
      uploadedBy: user.name || 'Admin',
    });

    // Notify all students of new material
    try {
      dbService.createNotification(
        'ALL',
        `New PDF Material Added: ${title.trim()}`,
        `Admin uploaded a new PDF in ${section} (${subject}): "${title.trim()}". Check it out!`,
        'SYSTEM'
      );
    } catch (e) {
      console.error('[Materials] Error dispatching notification:', e);
    }

    return res.status(201).json({
      success: true,
      message: 'PDF material successfully added to ' + section,
      material: newMaterial,
    });
  } catch (error) {
    console.error('[Materials] Error adding PDF material:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload PDF material.' });
  }
});

// DELETE /api/materials/:id - Admin only: Delete PDF material
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only administrator accounts can delete PDF materials.',
      });
    }

    const success = dbService.deletePdfMaterial(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Material not found or already deleted.' });
    }

    return res.json({ success: true, message: 'PDF material deleted successfully.' });
  } catch (error) {
    console.error('[Materials] Error deleting material:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete PDF material.' });
  }
});

export default router;
