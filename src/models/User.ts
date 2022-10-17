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
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
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
  visible: {
    type: Boolean,
    default: true
  },
  subscribed_users: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  date: {
    type: Date,
  }
});

export default mongoose.model("users", UserSchema);
