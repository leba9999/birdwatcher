import mongoose from 'mongoose';
import { Post } from '../../interfaces/Post';

const postSchema = new mongoose.Schema<Post>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  spottedAt: {
    type: Date,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  bird: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bird',
    required: true,
  },
  filename: {
    type: String,
  },
});

export default mongoose.model<Post>('Post', postSchema);
