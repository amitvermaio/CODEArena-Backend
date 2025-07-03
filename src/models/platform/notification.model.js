import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['LIKE', 'COMMENT', 'FOLLOW', 'CONNECTION_REQUEST', 'CONTEST_STARTING', 'PROBLEM_SOLVED'], required: true },
    link: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;