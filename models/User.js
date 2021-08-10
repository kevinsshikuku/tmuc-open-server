import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

/**
 * User schema that has references to Post, Like,Rating, Comment, Follow and Notification schemas
 */
const userSchema = new Schema(
  {
    phonenumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      lowercase: true,
    },
    fullname:{
      type:String,
      trim:false,
      unique:false,
      default:null,
      required: false,
    },
    location:{
      type:String,
      default: null,
      required: false,
    },
    facebook: {
      type:String,
      unique:false,
      required: false,
    },
    twitter: {
      type:String,
      unique:false,
      required: false,
    },
    instagram: {
      type:String,
      unique:false,
      required: false,
    },
    email:{
      type:String,
      trim:true,
      unique:false,
      required: false,
    },
    businessdescription: {
       type: String,
       default: null
    },
    passwordResetToken: String,
    passwordResetTokenExpiry: Date,
    password: {
      type: String,
      required: true,
    },
    image: String,
    imagePublicId: String,
    coverImage: String,
    coverImagePublicId: String,
    isOnline: {
      type: Boolean,
      default: false,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    buys: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Buy',
      },
    ],
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: 'View',
        }
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Hashes the users password when saving it to DB
 */
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });
});

export default mongoose.model('User', userSchema);
