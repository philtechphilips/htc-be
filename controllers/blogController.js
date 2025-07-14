const { v4: uuidv4 } = require('uuid');
const schema = require('../utils/schema');
const { errorResponse, successResponse } = require('../utils/helpers/response');

// Create a new blog post
exports.createBlog = async (req, res) => {
  const {
    title,
    content,
    excerpt,
    tags,
    featured_image,
    status = 'draft',
    meta_title,
    meta_description,
  } = req.body;

  const author_id = req.user.id;

  try {
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingBlog = await schema.fetchOne('blogs', { slug });
    if (existingBlog) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'A blog post with this title already exists',
      });
    }

    const blogData = {
      id: uuidv4(),
      title,
      slug,
      content,
      excerpt,
      author_id,
      tags: tags ? JSON.stringify(tags) : null,
      featured_image,
      status,
      meta_title,
      meta_description,
      published_at: status === 'published' ? new Date() : null,
    };

    await schema.create('blogs', blogData);

    return successResponse(res, {
      statusCode: 201,
      message: 'Blog post created successfully',
      payload: { id: blogData.id, slug },
    });
  } catch (err) {
    console.error('Create blog error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get all blogs (for admin dashboard)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await schema.fetchData(
      'blogs',
      { isDeleted: 0 },
      {
        populate: [{ field: 'author_id', table: 'users', as: 'author' }],
        orderBy: 'created_at DESC',
      }
    );

    // Transform blogs for frontend display
    const transformedBlogs = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      author: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : 'Unknown',
      status: blog.status.charAt(0).toUpperCase() + blog.status.slice(1),
      date: new Date(blog.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      views: blog.views || 0,
      slug: blog.slug,
      excerpt: blog.excerpt,
      featured_image: blog.featured_image,
    }));

    return successResponse(res, {
      statusCode: 200,
      message: 'Blogs fetched successfully',
      payload: transformedBlogs,
    });
  } catch (err) {
    console.error('Get blogs error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await schema.fetchOne('blogs', { id, isDeleted: 0 });

    if (!blog) {
      return errorResponse(res, { statusCode: 404, message: 'Blog post not found' });
    }

    // Parse tags if they exist
    if (blog.tags) {
      try {
        // Try to parse as JSON first
        blog.tags = JSON.parse(blog.tags);
      } catch (error) {
        // If JSON parsing fails, treat as comma-separated string
        blog.tags = blog.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Blog post fetched successfully',
      payload: blog,
    });
  } catch (err) {
    console.error('Get blog error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Update blog post
exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, tags, featured_image, status, meta_title, meta_description } =
    req.body;

  try {
    const blog = await schema.fetchOne('blogs', { id, isDeleted: 0 });

    if (!blog) {
      return errorResponse(res, { statusCode: 404, message: 'Blog post not found' });
    }

    // Generate new slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if new slug already exists
      const existingBlog = await schema.fetchOne('blogs', { slug, id: { $ne: id } });
      if (existingBlog) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'A blog post with this title already exists',
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (status !== undefined) updateData.status = status;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;

    // Set published_at if status changes to published
    if (status === 'published' && blog.status !== 'published') {
      updateData.published_at = new Date();
    }

    await schema.update('blogs', { id }, updateData);

    return successResponse(res, {
      statusCode: 200,
      message: 'Blog post updated successfully',
      payload: null,
    });
  } catch (err) {
    console.error('Update blog error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Delete blog post (soft delete)
exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await schema.fetchOne('blogs', { id, isDeleted: 0 });

    if (!blog) {
      return errorResponse(res, { statusCode: 404, message: 'Blog post not found' });
    }

    await schema.update('blogs', { id }, { isDeleted: 1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'Blog post deleted successfully',
      payload: null,
    });
  } catch (err) {
    console.error('Delete blog error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get published blogs (for public frontend)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await schema.fetchData(
      'blogs',
      { status: 'published', isDeleted: 0 },
      {
        populate: [{ field: 'author_id', table: 'users', as: 'author' }],
        orderBy: 'published_at DESC',
      }
    );

    // Transform blogs for public display
    const transformedBlogs = blogs.map((blog) => {
      let tags = [];
      if (blog.tags && typeof blog.tags === 'string') {
        try {
          // Try to parse as JSON first
          tags = JSON.parse(blog.tags);
        } catch (error) {
          // If JSON parsing fails, treat as comma-separated string
          tags = blog.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        }
      } else if (!blog.tags) {
        tags = [];
      }

      return {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : 'Unknown',
        featured_image: blog.featured_image,
        views: blog.views || 0,
        published_at: blog.published_at,
        tags: tags,
      };
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Published blogs fetched successfully',
      payload: transformedBlogs,
    });
  } catch (err) {
    console.error('Get published blogs error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get blog by slug (for public frontend)
exports.getBlogBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const blog = await schema.fetchOne('blogs', { slug, status: 'published', isDeleted: 0 });

    if (!blog) {
      return errorResponse(res, { statusCode: 404, message: 'Blog post not found' });
    }

    // Increment views
    await schema.update('blogs', { id: blog.id }, { views: (blog.views || 0) + 1 });

    // Parse tags if they exist
    if (blog.tags && typeof blog.tags === 'string') {
      try {
        // Try to parse as JSON first
        blog.tags = JSON.parse(blog.tags);
      } catch (error) {
        // If JSON parsing fails, treat as comma-separated string
        blog.tags = blog.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
    } else if (!blog.tags) {
      // If tags is null or undefined, set to empty array
      blog.tags = [];
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Blog post fetched successfully',
      payload: blog,
    });
  } catch (err) {
    console.error('Get blog by slug error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
