import express from 'express';
import { deleteRoomHandler, getLiveKitToken } from '../controller/livekitController';

const router = express.Router();

router.post('/token', getLiveKitToken);
router.post('/deleteRoom', deleteRoomHandler);

export default router; 