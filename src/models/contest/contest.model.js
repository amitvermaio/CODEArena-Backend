import mongoose, { Schema } from 'mongoose';

const leaderboardEntrySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    problemStats: { type: Map, of: { score: Number, attempts: Number, time: Date } }
}, { _id: false });

const contestSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Weekly', 'Mega', 'Sponsored'], required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    registrants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    leaderboard: [leaderboardEntrySchema],
    sponsoredBy: { organizationName: String, organizationLogo: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;