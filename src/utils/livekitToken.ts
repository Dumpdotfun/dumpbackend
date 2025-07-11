import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } from './constants';

const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);


export async function generateLiveKitToken(roomName: string, participantName: string, userId: string, expireSeconds = 3600) {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit API Key or Secret not configured');
  }
  
  if (!roomName || !participantName || !userId) {
    throw new Error('Missing required parameters: roomName, participantName, or userId');
  }
  
  console.log("Generating LiveKit token for room:", roomName, "participant:", participantName, "userId:", userId);
  
  try {
    // Check if room exists
    const rooms = await roomService.listRooms();
    console.log("Available rooms:", rooms);
    
    const roomExists = rooms.some(room => room.name === roomName);
    console.log("Room exists:", roomExists);
    
    // Create room if it doesn't exist
    if (!roomExists) {
      console.log("Creating room:", roomName);
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 20,
      });
      console.log("Room created successfully:", roomName);
    }
    
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      name: participantName,
      ttl: expireSeconds,
    });
    
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });
    
    const token = await at.toJwt(); 
    console.log("Token generated successfully for room:", roomName);
    return token;
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    throw new Error('Failed to generate LiveKit token');
  }
}

export async function deleteRoom(roomName: string) {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit API Key or Secret not configured');
  }
  
  if (!roomName) {
    throw new Error('Missing required parameter: roomName');
  }
  
  console.log("Deleting room:", roomName);
  
  try {
    // Check if room exists first
    const rooms = await roomService.listRooms();
    const roomExists = rooms.some(room => room.name === roomName);
    
    if (!roomExists) {
      console.log("Room does not exist:", roomName);
      return { success: false, message: 'Room does not exist' };
    }
    
    // Delete the room
    await roomService.deleteRoom(roomName);
    console.log("Room deleted successfully:", roomName);
    
    return { success: true, message: 'Room deleted successfully' };
  } catch (error) {
    console.error("Error deleting room:", error);
    throw new Error('Failed to delete room');
  }
}

export async function listRooms() {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LiveKit API Key or Secret not configured');
  }
  
  try {
    const rooms = await roomService.listRooms();
    console.log("Retrieved rooms:", rooms);
    return rooms;
  } catch (error) {
    console.error("Error listing rooms:", error);
    throw new Error('Failed to list rooms');
  }
}