import { Request, Response } from 'express';
import { deleteRoom, generateLiveKitToken } from '../utils/livekitToken';

export const getLiveKitToken = async (req: Request, res: Response) => {
  try {
    const { roomName, participantName, userId } = req.body;
    
    // Validate required fields
    if (!roomName || !participantName || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['roomName', 'participantName', 'userId'],
        received: { roomName, participantName, userId }
      });
    }

    // Validate field types
    if (typeof roomName !== 'string' || typeof participantName !== 'string' || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'All fields must be strings',
        received: { 
          roomName: typeof roomName, 
          participantName: typeof participantName, 
          userId: typeof userId 
        }
      });
    }

    // Clean room name: only alphanumeric and underscores
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9_]/g, '');
    
    console.log('Generating token for:', { cleanRoomName, participantName, userId });
    
    const token = await generateLiveKitToken(cleanRoomName, participantName, userId);
    
    return res.json({ 
      token,
      roomName: cleanRoomName,
      participantName,
      userId 
    });
  } catch (error: any) {
    console.error('Error in getLiveKitToken:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate token',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 

export const deleteRoomHandler = async (req: Request, res: Response) => {
  try {
    const { roomName } = req.body;
    
    // Validate required fields
    if (!roomName) {
      return res.status(400).json({ 
        error: 'Missing required field: roomName',
        received: { roomName }
      });
    }

    // Validate field type
    if (typeof roomName !== 'string') {
      return res.status(400).json({ 
        error: 'roomName must be a string',
        received: { roomName: typeof roomName }
      });
    }

    // Clean room name: only alphanumeric and underscores
    const cleanRoomName = roomName.replace(/[^a-zA-Z0-9_]/g, '');
    
    console.log('Deleting room:', cleanRoomName);
    
    const result = await deleteRoom(cleanRoomName);
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: result.message,
        roomName: cleanRoomName 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: result.message,
        roomName: cleanRoomName 
      });
    }
  } catch (error: any) {
    console.error('Error in deleteRoomHandler:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to delete room',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};