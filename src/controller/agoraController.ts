import { Request, Response } from 'express';
import { generateAgoraToken } from '../utils/agoraToken';

export const getAgoraToken = (req: Request, res: Response) => {
  const { channelName, uid, role } = req.body;
  if (!channelName || !uid) {
    return res.status(400).json({ error: 'channelName and uid are required' });
  }
  try {
    const token = generateAgoraToken(channelName, uid, role);
    return res.json({ token });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate token' });
  }
};