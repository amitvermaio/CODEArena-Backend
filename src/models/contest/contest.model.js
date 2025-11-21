import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

const leaderboardEntrySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    problemStats: {
      type: Map,
      of: {
        score: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
        penalty: { type: Number, default: 0 },
      },
    },
  },
  { _id: false }
);

const contestSchema = new Schema(
  {
    coverImage: { type: String, required: true },
    coverImageId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },

    startTime: { type: Date, required: true, index: true },
    length: { type: Number, required: true }, 
    endTime: { type: Date }, 
    registrationDeadline: { type: Date }, 

    problems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    registrants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    leaderboard: [leaderboardEntrySchema],
  },
  { timestamps: true }
);

// Auto-generate endTime + registrationDeadline + slug
contestSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.isModified("startTime") || this.isModified("length") || this.isNew) {
    this.endTime = new Date(this.startTime.getTime() + this.length * 60000);
    this.registrationDeadline = new Date(this.startTime.getTime() - 1000);
  }

  next();
});

const Contest = mongoose.model("Contest", contestSchema);
export { Contest };