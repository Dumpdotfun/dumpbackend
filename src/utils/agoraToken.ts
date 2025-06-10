import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { AGORA_APP_ID, AGORA_APP_CERTIFICATE } from './constants';

export function generateAgoraToken(channelName: string, uid: string | number, role: 'publisher' | 'subscriber' = 'publisher', expireSeconds = 3600) {
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    throw new Error('Agora App ID or Certificate not set');
  }
  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expireSeconds;
  return RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    Number(uid),
    agoraRole,
    privilegeExpireTs
  );
} 