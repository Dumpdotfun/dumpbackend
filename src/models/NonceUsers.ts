// models/PendingUser.ts
import mongoose from 'mongoose';

const nonceUserSchema = new mongoose.Schema({
  wallet: { type: String, required: true,},
  nonce: { type: String, required: true},
  expiredTime: { type: Date, expires: '20m', default: Date.now}
});

const NonceUsers = mongoose.model('NonceUsers', nonceUserSchema);

export default NonceUsers;
