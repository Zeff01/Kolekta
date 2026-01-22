import mongoose, { Schema, Document } from 'mongoose';
import { PokemonCard, CardCondition, CardGradingStatus, CardGrading } from '@/types/pokemon';

export interface IMarketplaceListing extends Document {
  userId: mongoose.Types.ObjectId;
  cardId: string;
  card: PokemonCard;
  quantity: number;
  pricePerCard: number; // In PHP
  condition: CardCondition;
  gradingStatus: CardGradingStatus;
  grading?: CardGrading;
  description?: string;
  images?: string[]; // URLs to additional photos
  status: 'active' | 'sold' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cardId: {
      type: String,
      required: true,
      index: true,
    },
    card: {
      type: Schema.Types.Mixed,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerCard: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ['Raw', 'LP', 'MP', 'HP', 'Damaged'],
      required: true,
    },
    gradingStatus: {
      type: String,
      enum: ['raw', 'graded'],
      required: true,
      default: 'raw',
    },
    grading: {
      company: {
        type: String,
        enum: ['PSA', 'CGC', 'BGS'],
      },
      grade: String,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    images: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['active', 'sold', 'cancelled'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
MarketplaceListingSchema.index({ status: 1, createdAt: -1 });
MarketplaceListingSchema.index({ userId: 1, status: 1 });
MarketplaceListingSchema.index({ cardId: 1, status: 1 });

export default mongoose.models.MarketplaceListing ||
  mongoose.model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema);
