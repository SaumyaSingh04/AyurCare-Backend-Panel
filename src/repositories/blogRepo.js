'use strict';

const BaseRepository = require('./baseRepo');
const Blog = require('../models/Blog');

class BlogRepository extends BaseRepository {
  constructor() { super(Blog); }

  async findPublished(filter = {}, options = {}) {
    return this.findAll({ ...filter, status: 'published' }, options);
  }

  async findBySlug(slug) {
    return this.model.findOne({ slug, status: 'published' })
      .populate('author', 'firstName lastName avatar')
      .lean();
  }

  async findBySlugAdmin(slug) {
    return this.model.findOne({ slug })
      .populate('author', 'firstName lastName avatar')
      .lean();
  }

  async incrementViews(id) {
    return this.model.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  async toggleLike(id, increment = true) {
    return this.model.findByIdAndUpdate(id, { $inc: { likes: increment ? 1 : -1 } }, { new: true });
  }

  async search(query, filter = {}, skip = 0, limit = 20) {
    const searchFilter = query
      ? { ...filter, $text: { $search: query }, status: 'published' }
      : { ...filter, status: 'published' };

    return this.model.find(searchFilter, query ? { score: { $meta: 'textScore' } } : {})
      .sort(query ? { score: { $meta: 'textScore' } } : { publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'firstName lastName avatar')
      .select('title slug excerpt coverImage author category tags publishedAt views likes isFeatured')
      .lean();
  }

  async buildFilter(query) {
    const filter = {};
    if (query.category) filter.category = new RegExp(query.category, 'i');
    if (query.tags) filter.tags = { $in: query.tags.split(',').map(t => t.trim().toLowerCase()) };
    if (query.author) filter.author = query.author;
    if (query.isFeatured === 'true') filter.isFeatured = true;
    return filter;
  }
}

module.exports = new BlogRepository();
