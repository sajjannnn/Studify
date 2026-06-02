import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import { authMiddleware } from '../middlewares/authMiddlewares';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

async function proxy(req: any, res: any, targetBase: string, pathPrefix: string, targetPrefix: string) {
  try {
    const targetPath = req.originalUrl.replace(pathPrefix, targetPrefix);
    const url = `http://${targetBase}${targetPath}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': req.user.id,
    };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization as string;
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text();

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to communicate with ${targetBase}` });
  }
}

async function uploadProxy(req: any, res: any) {
  try {
    const targetPath = req.originalUrl.replace('/api/notesservice', '/api');
    const url = `http://${process.env.NOTES_SERVICE_URL || 'localhost:4003'}${targetPath}`;

    const form = new FormData();
    if (req.file) {
      form.append('pdf', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    }
    if (req.body) {
      for (let [key, value] of Object.entries(req.body)) {
        key = key.replace(/\[\]$/, '');
        if (Array.isArray(value)) {
          value.forEach((v) => form.append(key, v));
        } else if (typeof value === 'string' && value) {
          form.append(key, value);
        }
      }
    }
    form.append('userId', req.user.id);

    const headers: Record<string, string> = {
      'X-User-Id': req.user.id,
    };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization as string;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, ...form.getHeaders() },
      body: form.getBuffer(),
    });

    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text();

    res.status(response.status).json(data);
  } catch (error) {
    console.error('uploadProxy error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}

const searchUrl = process.env.SEARCH_SERVICE_URL || 'localhost:4001';
const workspaceUrl = process.env.WORKSPACE_SERVICE_URL || 'localhost:4002';
const notesUrl = process.env.NOTES_SERVICE_URL || 'localhost:4003';

router.post('/notesservice/posts', authMiddleware, upload.single('pdf'), uploadProxy);
router.use('/searchservie', authMiddleware, (req, res) => proxy(req, res, searchUrl, '/api/searchservie', '/api'));
router.use('/workspace', authMiddleware, (req, res) => proxy(req, res, workspaceUrl, '/api/workspace', '/api/workspace'));
router.use('/notesservice', authMiddleware, (req, res) => proxy(req, res, notesUrl, '/api/notesservice', '/api'));

export default router;
