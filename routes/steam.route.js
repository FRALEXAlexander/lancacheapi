import express from 'express';
import { getApps,getCacheStatus, getCachedApps } from '../controllers/steam.controller.js';
const router = express.Router();

router.get('/apps', getApps);
router.get('/cache', getCacheStatus);
router.get('/cachedApps', getCachedApps);

export default router;