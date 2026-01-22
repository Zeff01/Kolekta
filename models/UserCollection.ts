import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGradingInfo {
  company: 'PSA' | 'CGC' | 'BGS';
  grade: string;
}

export interface ICollectionItem {
  card: Record<string, unknown>; // Store full Pokemon card object
  quantity: number;
  lockedQuantity?: number; // Quantity locked in marketplace listings
  purchasePrice?: number;
  condition?: 'Raw' | 'LP' | 'MP' | 'HP' | 'Damaged';
  grading?: IGradingInfo;
  addedAt: Date;
}

export interface IWishlistItem {
  card: Record<string, unknown>; // Store full Pokemon card object
  priority: 'low' | 'medium' | 'high';
  addedAt: Date;
}

export interface IUserCollection extends Omit<Document, 'collection'> {
  userId: mongoose.Types.ObjectId;
  collection: ICollectionItem[];
  wishlist: IWishlistItem[];
  updatedAt: Date;
}

const GradingInfoSchema = new Schema<IGradingInfo>({
  company: { type: String, enum: ['PSA', 'CGC', 'BGS'], required: true },
  grade: { type: String, required: true },
}, { _id: false });

const CollectionItemSchema = new Schema<ICollectionItem>({
  card: { type: Schema.Types.Mixed, required: true }, // Store full card object
  quantity: { type: Number, required: true, default: 1 },
  lockedQuantity: { type: Number, default: 0 }, // Quantity locked in marketplace listings
  purchasePrice: { type: Number, required: false },
  condition: { type: String, enum: ['Raw', 'LP', 'MP', 'HP', 'Damaged'], required: false },
  grading: { type: GradingInfoSchema, required: false },
  addedAt: { type: Date, default: Date.now },
});

const WishlistItemSchema = new Schema<IWishlistItem>({
  card: { type: Schema.Types.Mixed, required: true }, // Store full card object
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  addedAt: { type: Date, default: Date.now },
});

const UserCollectionSchema = new Schema<IUserCollection>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  collection: [CollectionItemSchema],
  wishlist: [WishlistItemSchema],
}, {
  timestamps: true,
});

// Indexes for faster queries
UserCollectionSchema.index({ userId: 1 });
UserCollectionSchema.index({ 'collection.card.id': 1 });
UserCollectionSchema.index({ 'wishlist.card.id': 1 });

const UserCollection: Model<IUserCollection> =
  mongoose.models.UserCollection || mongoose.model<IUserCollection>('UserCollection', UserCollectionSchema);

export default UserCollection;
