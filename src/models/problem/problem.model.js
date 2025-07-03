import mongoose, { Schema } from 'mongoose';

const testCaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    isSample: { type: Boolean, default: false }
});

const problemSchema = new Schema({
    title: { type: String, required: true, unique: true, trim: true },
    statement: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
    tags: [{ type: String, index: true }],
    constraints: { type: String, required: true },
    testCases: [testCaseSchema],
    timeLimit: { type: Number, required: true, default: 1000 },
    memoryLimit: { type: Number, required: true, default: 256 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    editorial: { type: String }
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;