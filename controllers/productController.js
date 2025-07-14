const { v4: uuidv4 } = require('uuid');
const schema = require('../utils/schema');
const { errorResponse, successResponse } = require('../utils/helpers/response');

exports.addCategory = async (req, res) => {
  const { name, description, image } = req.body;
  try {
    // Check for duplicate category name (case-insensitive)
    const existing = await schema.fetchOne('categories', { name: name.trim() });
    if (existing) {
      return errorResponse(res, { statusCode: 400, message: 'Category already exists' });
    }
    const id = uuidv4();
    await schema.create('categories', { id, name, description, image });
    return successResponse(res, {
      statusCode: 201,
      message: 'Category created',
      payload: { id, name, description, image },
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await schema.fetchData('categories');
    // For each category, count products
    for (const cat of categories) {
      // Use schema.fetchData for product count
      const products = await schema.fetchData('products', { category_id: cat.id });
      cat.productCount = products.length;
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Categories fetched',
      payload: categories,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  let { name, image, category_id, details, images } = req.body;
  try {
    // Check category exists
    const category = await schema.fetchOne('categories', { id: category_id });
    if (!category) {
      return errorResponse(res, { statusCode: 400, message: 'Category not found' });
    }
    // Auto-generate slug from name
    let slug = name
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const id = uuidv4();
    try {
      await schema.create('products', {
        id,
        name,
        slug,
        image,
        category_id,
        details,
        images: JSON.stringify(images),
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return errorResponse(res, { statusCode: 400, message: 'Slug already exists' });
      }
      throw err;
    }
    return successResponse(res, {
      statusCode: 201,
      message: 'Product created',
      payload: { id, name, slug, image, category_id, details, images },
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    // Fetch all products and populate category
    const products = await schema.fetchData(
      'products',
      {},
      { populate: [{ field: 'category_id', table: 'categories', as: 'category' }] }
    );
    // Parse images JSON and remove category_id
    const productsWithCategory = products.map((prod) => {
      let images = prod.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
          /* ignore */
        }
      }
      return {
        ...prod,
        images,
      };
    });
    return successResponse(res, {
      statusCode: 200,
      message: 'Products fetched',
      payload: productsWithCategory,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  const { category_id } = req.params;
  try {
    const products = await schema.fetchData(
      'products',
      { category_id },
      { populate: [{ field: 'category_id', table: 'categories', as: 'category' }] }
    );
    const productsWithCategory = products.map((prod) => {
      let images = prod.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
          /* ignore */
        }
      }
      return {
        ...prod,
        images,
      };
    });
    return successResponse(res, {
      statusCode: 200,
      message: 'Products fetched',
      payload: productsWithCategory,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await schema.fetchOne(
      'products',
      { id },
      { populate: [{ field: 'category_id', table: 'categories', as: 'category' }] }
    );
    if (!product) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    }
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        /* ignore */
      }
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Product fetched',
      payload: { ...product, images },
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await schema.fetchOne(
      'products',
      { slug },
      { populate: [{ field: 'category_id', table: 'categories', as: 'category' }] }
    );
    if (!product) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    }
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        /* ignore */
      }
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Product fetched',
      payload: { ...product, images },
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await schema.update('products', { id }, { isDeleted: 1 });
    if (!deleted) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Product deleted',
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  try {
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }
    const updated = await schema.update('products', { id }, updateData);
    if (!updated) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found or already deleted',
      });
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Product updated',
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await schema.update('categories', { id }, { isDeleted: 1 });
    if (!deleted) {
      return errorResponse(res, { statusCode: 404, message: 'Category not found' });
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Category deleted',
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  try {
    const category = await schema.fetchOne('categories', { id, isDeleted: 0 });
    if (!category) {
      return errorResponse(res, { statusCode: 404, message: 'Category not found' });
    }

    // Check for duplicate category name (case-insensitive) if name is being updated
    if (name && name !== category.name) {
      const existing = await schema.fetchOne('categories', { name: name.trim(), isDeleted: 0 });
      if (existing && existing.id !== id) {
        return errorResponse(res, { statusCode: 400, message: 'Category name already exists' });
      }
    }

    await schema.update('categories', { id }, { name, description, image });

    return successResponse(res, {
      statusCode: 200,
      message: 'Category updated',
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Fetch featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await schema.fetchData(
      'products',
      { isFeatured: 1 },
      { populate: [{ field: 'category_id', table: 'categories', as: 'category' }] }
    );
    const productsWithCategory = products.map((prod) => {
      let images = prod.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
          /* ignore */
        }
      }
      return {
        ...prod,
        images,
      };
    });
    return successResponse(res, {
      statusCode: 200,
      message: 'Featured products fetched',
      payload: productsWithCategory,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
