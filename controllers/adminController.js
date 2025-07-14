const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const schema = require('../utils/schema');
const { errorResponse, successResponse } = require('../utils/helpers/response');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await schema.fetchOne('users', { email });
    if (user)
      return errorResponse(res, {
        statusCode: 400,
        message: 'Admin already exists',
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await schema.create('users', {
      id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
    });
    const newUser = await schema.fetchOne('users', { id });
    if (newUser && newUser.password) delete newUser.password;
    return successResponse(res, {
      statusCode: 201,
      message: 'Admin registered',
      payload: newUser,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await schema.fetchOne('users', { email, role: 'admin' });
    if (!user)
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid credentials',
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid credentials',
      });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const { password: _pw, ...userWithoutPassword } = user;
    return successResponse(res, {
      statusCode: 200,
      message: 'Admin signed in successfully!',
      payload: userWithoutPassword,
      token,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total products
    const products = await schema.fetchData('products', { isDeleted: 0 });
    const totalProducts = products.length;

    // Get total users (customers)
    const users = await schema.fetchData('users', { role: 'user', isDeleted: 0 });
    const totalCustomers = users.length;

    // Get total orders from orders table
    const orders = await schema.fetchData('orders', { isDeleted: 0 });
    const totalOrders = orders.length;

    // Calculate total sales from orders
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

    // Get recent orders for dashboard
    const recentOrders = await schema.fetchData(
      'orders',
      { isDeleted: 0 },
      {
        populate: [{ field: 'user_id', table: 'users', as: 'user' }],
        orderBy: 'created_at DESC',
        limit: 5,
      }
    );

    const stats = {
      totalSales: `$${totalSales.toFixed(2)}`,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders: recentOrders.map((order) => ({
        id: order.order_number,
        customer: order.customer_name,
        total: `$${parseFloat(order.total_amount).toFixed(2)}`,
        status: order.status,
        date: order.created_at,
      })),
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Dashboard stats fetched',
      payload: stats,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get all users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await schema.fetchData('users', { isDeleted: 0 });
    // Remove password from response
    const safeUsers = users.map((user) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Users fetched',
      payload: safeUsers,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await schema.fetchOne('users', { id, isDeleted: 0 });
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    const { password, ...safeUser } = user;
    return successResponse(res, {
      statusCode: 200,
      message: 'User fetched',
      payload: safeUser,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNumber, address, street, apartment, city, state } =
    req.body;

  try {
    const user = await schema.fetchOne('users', { id, isDeleted: 0 });
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    await schema.update(
      'users',
      { id },
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        street,
        apartment,
        city,
        state,
      }
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'User updated',
      payload: null,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await schema.fetchOne('users', { id, isDeleted: 0 });
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    await schema.update('users', { id }, { isDeleted: 1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'User deleted',
      payload: null,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get recent cart activity for dashboard
exports.getRecentCartActivity = async (req, res) => {
  try {
    // Get recent cart items with user and product details
    const recentCart = await schema.fetchData(
      'cart',
      {},
      {
        populate: [
          { field: 'user_id', table: 'users', as: 'user' },
          { field: 'product_id', table: 'products', as: 'product' },
        ],
        orderBy: 'created_at DESC',
        limit: 10,
      }
    );

    // Transform the data for dashboard display
    const transformedActivity = recentCart.map((item, index) => ({
      id: `#CART-${String(index + 1).padStart(3, '0')}`,
      customer: item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown User',
      product: item.product ? item.product.name : 'Unknown Product',
      amount: item.product && item.product.price ? `$${item.product.price}` : '$0.00',
      status: 'In Cart',
      date: item.created_at,
      quantity: item.quantity,
      userEmail: item.user ? item.user.email : null,
    }));

    return successResponse(res, {
      statusCode: 200,
      message: 'Recent cart activity fetched',
      payload: transformedActivity,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get product analytics for dashboard
exports.getProductAnalytics = async (req, res) => {
  try {
    // Get all products
    const products = await schema.fetchData('products', { isDeleted: 0 });

    // Get all categories
    const categories = await schema.fetchData('categories');

    // Get featured products count
    const featuredProducts = products.filter((product) => product.isFeatured);

    // Get products by category
    const productsByCategory = categories.map((category) => {
      const categoryProducts = products.filter((product) => product.category_id === category.id);
      return {
        categoryName: category.name,
        productCount: categoryProducts.length,
        categoryId: category.id,
      };
    });

    const analytics = {
      totalProducts: products.length,
      featuredProducts: featuredProducts.length,
      categories: categories.length,
      productsByCategory,
      recentProducts: products.slice(0, 5).map((product) => ({
        id: product.id,
        name: product.name,
        category: categories.find((cat) => cat.id === product.category_id)?.name || 'Uncategorized',
        isFeatured: product.isFeatured,
        created_at: product.created_at,
      })),
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Product analytics fetched',
      payload: analytics,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
