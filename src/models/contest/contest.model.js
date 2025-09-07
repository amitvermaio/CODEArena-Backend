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
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    registrationDeadline: { type: Date },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    maxParticipants: { type: Number },
    problems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    registrants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    leaderboard: [leaderboardEntrySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

contestSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Contest = mongoose.model("Contest", contestSchema);
export { Contest };
