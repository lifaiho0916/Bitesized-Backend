import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  authProvider: {
    authId: {
      type: String
    },
    authType: {
      type: String,
      enum: ['Google', 'Apple', 'Facebook'],
    }
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: "USER",
  },
  personalisedUrl: {
    type: String,
    default: "",
  },
  categories: [{
    type: Number,
  }],
  bioText: {
    type: String,
    default: ""
  },
  language: {
    type: String,
    default: "EN",
  },
  earnings: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'usd'
  },
  visible: {
    type: Boolean,
    default: true
  },
  subscribe: {
    available: {
      type: Boolean,
      default: false,
    },
    switch: {
      type: Boolean,
      default: false
    }
  },
  date: {
    type: Date,
  }
});

export default mongoose.model("users", UserSchema)
