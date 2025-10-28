import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const profileColorEnum = [
  "default",
  "blue",
  "green",
  "purple",
  "red",
  "orange",
  "yellow",
  "pink",
  "slate",
  "stone",
  "indigo",
  "cyan",
];

const recentSubmissions = [
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Runtime Error",
      ],
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
];

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    profileColor: {
      type: String,
      enum: profileColorEnum,
      default: "blue",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Password is now optional, for users who sign up via OAuth
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    fullname: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    avatar: {
      type: String, // cloundinary url
    },
    problemSolved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    problemAttempted: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    ],
    location: {
      type: String,
      default: "Earth",
      trim: true,
    },
    website: {
      type: String,
      default: "",
    },
    socialLinks: {
      github: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      default: "",
      maxlength: 350,
    },
    recentSubmissions: recentSubmissions,
    // Fields to store OAuth provider IDs
    googleId: {
      type: String,
      immutable: true,
    },
    githubId: {
      type: String,
      immutable: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      select: false,
      immutable: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password if it's provided/modified
UserSchema.pre("save", async function (next) {
  // we're not using arrow fn here coz it doesn't have access to refrence "this"!!
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords for local login
UserSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateToken = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
}

export const User = mongoose.model("User", UserSchema);
