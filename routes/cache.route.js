import express from 'express';
import { getServers } from '../controllers/cache.controller.js';
const router = express.Router();
/* GET Server. */
router.get('/server', getServers);

export default router;