import mongoose, { Schema } from 'mongoose';

const badgeSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    iconUrl: { type: String, required: true },
    criteria: { type: String, required: true }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;