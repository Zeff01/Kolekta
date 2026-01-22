import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  listingId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  images?: string[]; // URLs to uploaded images (gcash receipt, address, etc)
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceListing',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    images: [{
      type: String,
    }],
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
MessageSchema.index({ listingId: 1, createdAt: 1 });
MessageSchema.index({ receiverId: 1, read: 1 }); // For unread message queries
MessageSchema.index({ senderId: 1, receiverId: 1, listingId: 1 }); // For thread queries

export default mongoose.models.Message ||
  mongoose.model<IMessage>('Message', MessageSchema);
