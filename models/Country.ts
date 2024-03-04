import mongoose, { Document, Schema } from 'mongoose';

interface Neighbor extends Document {
  countryId: mongoose.Types.ObjectId;
  neighborId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const neighborSchema: Schema = new Schema({
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  neighborId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

interface Country extends Document {
  name: string;
  cca3: string;
  currency_code: string;
  currency: string;
  capital: string;
  region: string;
  subregion: string;
  area: number;
  map_url: string;
  population: number;
  flag_url: string;
  neighbors: mongoose.Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const countrySchema: Schema = new Schema({
  name: String,
  cca3: String,
  currency_code: String,
  currency: String,
  capital: String,
  region: String,
  subregion: String,
  area: Number,
  map_url: String,
  population: Number,
  flag_url: String,
  neighbors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Neighbor' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const Country = mongoose.model<Country>('Country', countrySchema);
export const Neighbor = mongoose.model<Neighbor>('Neighbor', neighborSchema);
