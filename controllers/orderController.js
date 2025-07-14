const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const schema = require('../utils/schema');
const { errorResponse, successResponse } = require('../utils/helpers/response');

// Create a new order
exports.createOrder = async (req, res) => {
  const {
    userId,
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    apartment,
    street,
    city,
    state,
    cart: cartItems,
  } = req.body;

  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Fetch product details for each cart item
    const detailedCart = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product = await schema.fetchOne('products', { id: item.productId });
      if (!product) {
        return errorResponse(res, {
          statusCode: 404,
          message: `Product not found: ${item.productId}`,
        });
      }

      const itemTotal = (product.price || 0) * item.quantity;
      totalAmount += itemTotal;

      detailedCart.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price || 0,
        total: itemTotal,
        productDetails: product.details,
        productImage: product.image,
      });
    }

    if (!detailedCart.length) {
      return errorResponse(res, { statusCode: 400, message: 'Cart is empty' });
    }

    // Create order in database
    const orderId = uuidv4();
    const orderData = {
      id: orderId,
      user_id: userId,
      order_number: orderNumber,
      customer_name: `${firstName} ${lastName}`,
      customer_email: email,
      customer_phone: phoneNumber,
      shipping_address: address,
      apartment,
      street,
      city,
      state,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      order_items: JSON.stringify(detailedCart),
      notes: `Order created from cart checkout`,
    };

    await schema.create('orders', orderData);

    // Send email notification to admin
    const emailBody = `New Order Received\n\nOrder Number: ${orderNumber}\nCustomer: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber}\nAddress: ${address}, ${apartment ? apartment + ', ' : ''}${street ? street + ', ' : ''}${city}, ${state}\n\nOrder Items:\n${detailedCart.map((item, idx) => `${idx + 1}. ${item.productName} (Qty: ${item.quantity}) - $${item.total}`).join('\n')}\n\nTotal Amount: $${totalAmount}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminEmail = process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Order: ${orderNumber}`,
      text: emailBody,
    };

    await transporter.sendMail(mailOptions);

    return successResponse(res, {
      statusCode: 201,
      message: 'Order created successfully',
      payload: {
        orderId,
        orderNumber,
        totalAmount,
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get all orders (for admin dashboard)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await schema.fetchData(
      'orders',
      { isDeleted: 0 },
      {
        populate: [{ field: 'user_id', table: 'users', as: 'user' }],
        orderBy: 'created_at DESC',
      }
    );

    // Transform orders for frontend display
    const transformedOrders = orders.map((order) => {
      // Handle order_items - it might be a JSON object or a string
      let orderItems;
      try {
        orderItems =
          typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
      } catch (error) {
        console.error('Error parsing order_items:', error);
        orderItems = [];
      }

      return {
        id: order.order_number,
        customer: order.customer_name,
        email: order.customer_email,
        products: Array.isArray(orderItems)
          ? orderItems.map((item) => item.productName).join(', ')
          : 'No products',
        total: `$${parseFloat(order.total_amount).toFixed(2)}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        date: new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        payment: order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1),
        orderData: order,
      };
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Orders fetched successfully',
      payload: transformedOrders,
    });
  } catch (err) {
    console.error('Get orders error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await schema.fetchOne('orders', { order_number: id, isDeleted: 0 });

    if (!order) {
      return errorResponse(res, { statusCode: 404, message: 'Order not found' });
    }

    // Parse order items - handle both string and object formats
    let orderItems;
    try {
      orderItems =
        typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
    } catch (error) {
      console.error('Error parsing order_items:', error);
      orderItems = [];
    }

    const orderDetails = {
      ...order,
      order_items: orderItems,
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Order fetched successfully',
      payload: orderDetails,
    });
  } catch (err) {
    console.error('Get order error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body;

  try {
    const order = await schema.fetchOne('orders', { order_number: id, isDeleted: 0 });

    if (!order) {
      return errorResponse(res, { statusCode: 404, message: 'Order not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    await schema.update('orders', { order_number: id }, updateData);

    return successResponse(res, {
      statusCode: 200,
      message: 'Order status updated successfully',
      payload: null,
    });
  } catch (err) {
    console.error('Update order error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated request

  try {
    const orders = await schema.fetchData(
      'orders',
      { user_id: userId, isDeleted: 0 },
      {
        orderBy: 'created_at DESC',
      }
    );

    // Transform orders for frontend display
    const transformedOrders = orders.map((order) => {
      // Handle order_items - it might be a JSON object or a string
      let orderItems;
      try {
        orderItems =
          typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
      } catch (error) {
        console.error('Error parsing order_items:', error);
        orderItems = [];
      }

      return {
        id: order.order_number,
        customer: order.customer_name,
        email: order.customer_email,
        products: Array.isArray(orderItems)
          ? orderItems.map((item) => item.productName).join(', ')
          : 'No products',
        total: `$${parseFloat(order.total_amount).toFixed(2)}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        date: new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        payment: order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1),
        orderData: order,
      };
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'User orders fetched successfully',
      payload: transformedOrders,
    });
  } catch (err) {
    console.error('Get user orders error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get user's order by ID
exports.getUserOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Get user ID from authenticated request

  try {
    const order = await schema.fetchOne('orders', {
      order_number: id,
      user_id: userId,
      isDeleted: 0,
    });

    if (!order) {
      return errorResponse(res, { statusCode: 404, message: 'Order not found' });
    }

    // Parse order items - handle both string and object formats
    let orderItems;
    try {
      orderItems =
        typeof order.order_items === 'string' ? JSON.parse(order.order_items) : order.order_items;
    } catch (error) {
      console.error('Error parsing order_items:', error);
      orderItems = [];
    }

    const orderDetails = {
      ...order,
      order_items: orderItems,
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Order fetched successfully',
      payload: orderDetails,
    });
  } catch (err) {
    console.error('Get user order error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const orders = await schema.fetchData('orders', { isDeleted: 0 });

    const stats = {
      totalOrders: orders.length,
      totalSales: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
      processingOrders: orders.filter((order) => order.status === 'processing').length,
      shippedOrders: orders.filter((order) => order.status === 'shipped').length,
      deliveredOrders: orders.filter((order) => order.status === 'delivered').length,
      cancelledOrders: orders.filter((order) => order.status === 'cancelled').length,
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Order statistics fetched successfully',
      payload: stats,
    });
  } catch (err) {
    console.error('Get order stats error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
