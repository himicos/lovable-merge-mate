import { Router, Request, Response } from 'express';

export interface VisionBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  score?: number;
}

const router = Router();

/*
 * POST /api/vision/analyse
 * Accepts raw PNG (or any image) buffer in request body.
 * For demo purposes we return dummy bounding boxes. Replace the
 * implementation with a real vision API (OpenAI, Google Vision, etc.).
 */
router.post('/analyse', async (req: Request, res: Response) => {
  try {
    const imgBuf: Buffer = req.body as Buffer;
    if (!imgBuf || !Buffer.isBuffer(imgBuf)) {
      return res.status(400).json({ error: 'Expected binary image buffer' });
    }

    // TODO: Replace with real vision service
    // Dummy: return a single centered box
    const boxes: VisionBox[] = [
      {
        x: 100,
        y: 100,
        w: 300,
        h: 200,
        label: 'demo',
        score: 0.99,
      },
    ];

    res.json(boxes);
  } catch (error) {
    console.error('Vision analyse error:', error);
    res.status(500).json({ error: 'Vision analysis failed' });
  }
});

export const visionRouter = router;