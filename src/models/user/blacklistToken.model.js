import mongoose from "mongoose";

const blacklistTokenSchema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds (TTL)
  }
})

const blacklistTokenModel = mongoose.model('BlacklistToken', blacklistTokenSchema);

export default blacklistTokenModel;