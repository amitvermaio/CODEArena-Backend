import mongoose, { Schema } from 'mongoose';

const submissionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'], default: 'Pending' },
    executionTime: { type: Number },
    memoryUsed: { type: Number }
}, { timestamps: true });

submissionSchema.index({ user: 1, problem: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;