import mongoose, { Schema } from 'mongoose';

const collabSessionSchema = new Schema({
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sharedCode: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    videoCallLink: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const CollabSession = mongoose.model('CollabSession', collabSessionSchema);
export default CollabSession;