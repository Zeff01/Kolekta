import mongoose, { Schema, Document, Model } from 'mongoose';

// Card price snapshot interface
export interface ICardPrice extends Document {
  cardId: string;
  cardName: string;
  setId: string;
  setName: string;
  variant: 'normal' | 'holofoil' | 'reverseHolofoil' | 'firstEdition';

  // Pricing data from TCGPlayer
  marketPrice: number;
  lowPrice: number;
  midPrice: number;
  highPrice: number;
  directLowPrice?: number;

  // Metadata
  date: Date;
  createdAt: Date;
}

const CardPriceSchema = new Schema<ICardPrice>({
  cardId: {
    type: String,
    required: true,
    index: true,
  },
  cardName: {
    type: String,
    required: true,
  },
  setId: {
    type: String,
    required: true,
    index: true,
  },
  setName: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    enum: ['normal', 'holofoil', 'reverseHolofoil', 'firstEdition'],
    required: true,
    index: true,
  },
  marketPrice: {
    type: Number,
    required: true,
  },
  lowPrice: {
    type: Number,
    required: true,
  },
  midPrice: {
    type: Number,
    required: true,
  },
  highPrice: {
    type: Number,
    required: true,
  },
  directLowPrice: {
    type: Number,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
CardPriceSchema.index({ cardId: 1, variant: 1, date: -1 });

// Prevent model recompilation in development
const CardPrice: Model<ICardPrice> =
  mongoose.models.CardPrice || mongoose.model<ICardPrice>('CardPrice', CardPriceSchema);

export default CardPrice;
