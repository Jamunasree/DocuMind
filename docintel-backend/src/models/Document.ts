import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentDocument extends Document {
  name: string;
  originalName: string;
  status: 'queued' | 'processing' | 'processed' | 'error';
  size: number;
  type: string;
  path: string;
  user: mongoose.Types.ObjectId;
  uploadedAt: Date;
  processedAt?: Date;
  entities?: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  content?: string;
  metadata?: Record<string, any>;
}

const documentSchema = new Schema<IDocumentDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'processed', 'error'],
      default: 'queued',
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    entities: [
      {
        text: String,
        type: String,
        confidence: Number,
      },
    ],
    content: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ status: 1 });

export default mongoose.model<IDocumentDocument>('Document', documentSchema);