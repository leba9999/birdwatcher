import mongoose from 'mongoose';
import { Comment } from '../../interfaces/Comment';

const commentModel = new mongoose.Schema<Comment>({
    text: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

export default mongoose.model<Comment>('Comment', commentModel);