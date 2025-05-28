import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  tokenAddress: string;
  createdBy: string | Types.ObjectId;
  parentId?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  images?: string[];
  files?: {
    name: string;
    url: string;
  }[];
  isHoldersOnly: boolean;
}

const CommentSchema: Schema = new Schema({
  content: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  createdBy: { type: Schema.Types.Mixed, required: true }, // Can be either string (wallet) or ObjectId (user)
  parentId: { type: String },
  timestamp: { type: Number, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  images: [{ type: String }],
  files: [{
    name: { type: String },
    url: { type: String }
  }],
  isHoldersOnly: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better query performance
CommentSchema.index({ tokenAddress: 1, isHoldersOnly: 1 });
CommentSchema.index({ createdBy: 1 });
CommentSchema.index({ parentId: 1 });

export default model<IComment>('Comment', CommentSchema); 