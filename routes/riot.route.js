import express from 'express';
import { getGames } from '../controllers/riot.controller.js';
const router = express.Router();
/* GET Server. */
router.get('/games', getGames);

export default router;