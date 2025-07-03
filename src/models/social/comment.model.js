import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    text: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;