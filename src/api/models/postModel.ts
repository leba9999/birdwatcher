import mongoose from 'mongoose';
import { Post } from '../../interfaces/Post';

const postSchema = new mongoose.Schema<Post>({
  status: {
    type: String,
    enum: ['found', 'unknown'],
    default: 'unknown',
    required: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  filename: {
    type: String,
  },
});

export default mongoose.model<Post>('Post', postSchema);
