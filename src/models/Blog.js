'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  slug: { type: String, unique: true, lowercase: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 500 },

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  category: { type: String, trim: true, default: 'General' },
  tags: [{ type: String, lowercase: true, trim: true }],

  coverImage: { url: String, publicId: String, alt: String },

  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date },

  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },

  // SEO
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  metaKeywords: [String],

  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text', excerpt: 'text' });

// ─── Pre-save: slug ───────────────────────────────────────────────────────────
blogSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let slug = slugify(this.title, { lower: true, strict: true });
    const exists = await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } });
    if (exists) slug = `${slug}-${Date.now()}`;
    this.slug = slug;
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
