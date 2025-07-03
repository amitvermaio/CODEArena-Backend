import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    imageUrl: { type: String },
    caption: { type: String, required: true, maxlength: 2200 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    tags: [{ type: String, trim: true }]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;