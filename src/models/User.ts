// models/User.ts
import { string } from 'joi';
import mongoose, { Types } from 'mongoose';

const PINATA_GATEWAY_URL = process.env.PINATA_GATEWAY_URL;
const defualtImg = process.env.DEFAULT_IMG_HASH

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  wallet: { type: String, required: true, unique: true },
  avatar: { type: String, default: `${PINATA_GATEWAY_URL}/${defualtImg}` },
  following: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  bio: { type: String, default: "" }
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;