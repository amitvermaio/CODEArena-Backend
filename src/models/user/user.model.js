import mongoose, { Schema } from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
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
        select: false, 
    },
    fullname: { 
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    profilePic: {
        type: String,
        default: "https://icon-library.com/images/default-user-icon/default-user-icon-6.jpg",
    },
    dob: {
        type: Date,
        default: null,
    },
    connections: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ], // Server-managed: Only modified by connection logic
    problemSolved: [
        { type: Schema.Types.ObjectId, ref: 'Problem' }
    ], // Server-managed: Only modified upon successful problem submission
    contestWon: [
        { type: Schema.Types.ObjectId, ref: 'Contest' }
    ], // Server-managed: Only modified when a contest is won
    badges: [
        { type: Schema.Types.ObjectId, ref: 'Badge' }
    ], // Server-managed: Only awarded by the server based on achievements
    location: {
        type: String,
        default: 'Earth', 
        trim: true,
    },
    website: {
        type: String,
        default: ''
    },
    socialLinks: {
        github: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        },
        facebook: {
            type: String,
            default: ''
        }
    },
    skills: [{
        type: String,
        trim: true
    }],
    bio: {
        type: String,
        default: '',
        maxlength: 350, 
    },
    // Fields to store OAuth provider IDs
    googleId: {
        type: String,
        immutable: true, 
    },
    githubId: {
        type: String,
        immutable: true,
    },
    linkedinId: {
        type: String,
        immutable: true, 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        select: false, 
        immutable: true, 
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        select: false, 
    },
    isActive: {
        type: Boolean,
        default: true, 
        select: false, 
    },
    isDeleted: {
        type: Boolean,
        default: false, 
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
}, { timestamps: true });

// Pre-save hook to hash password if it's provided/modified
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords for local login
UserSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate access token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Method to generate refresh token
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model('User', UserSchema);