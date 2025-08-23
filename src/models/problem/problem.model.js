import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';


const testCaseSchema = new Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    isSample: { type: Boolean, default: false }
});

const problemSchema = new Schema({
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, index: true }, 
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


problemSchema.pre('save', function(next) {
    // Generate a slug if the title is new or has been modified
    if (this.isModified('title') || this.isNew) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});


problemSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    // Check if the title is being updated in a $set operation
    if (update.$set && update.$set.title) {
        // Only generate a new slug if one isn't being provided explicitly
        if (!update.$set.slug) {
            update.$set.slug = slugify(update.$set.title, { lower: true, strict: true });
        }
    }
    next();
});


const Problem = mongoose.model('Problem', problemSchema);
export { Problem };