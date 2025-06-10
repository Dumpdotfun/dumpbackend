import express from 'express';
import { getAgoraToken } from '../controller/agoraController';

const router = express.Router();

router.post('/token', getAgoraToken);
router.post('/refresh-token', getAgoraToken);

export default router; 