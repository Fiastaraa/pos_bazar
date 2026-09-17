import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

// Gunakan memoryStorage agar kompatibel sempurna di serverless (Vercel) & lokal
const storage = multer.memoryStorage();

// Filter hanya file gambar
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimeMatch = allowedTypes.test(file.mimetype);
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeMatch && extMatch) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF) yang diizinkan!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter,
});

// POST /api/upload
router.post('/', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file gambar yang diunggah',
      });
    }

    // Ubah ke Data URL Base64 yang aman disimpan di database dan tampil langsung di frontend
    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    return res.status(201).json({
      success: true,
      message: 'Foto menu berhasil diunggah',
      url: base64Data,
      filename: req.file.originalname,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengunggah foto',
    });
  }
});

export default router;
