import Order from '../models/order-model.js';
import Product from '../models/product-model.js';
import mongoose from 'mongoose';

const allowedPayments = new Set(['cash', 'card']);

const cleanText = (value, maxLength = 200) =>
    typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const orderError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

export const prepareOrderProducts = (requestedProducts, availableProducts) => {
    if (!Array.isArray(requestedProducts) || requestedProducts.length === 0) {
        throw orderError('Cart is empty');
    }

    if (requestedProducts.length > 50) {
        throw orderError('Too many products in one order');
    }

    const productsById = new Map(
        availableProducts.map((product) => [String(product._id), product])
    );

    return requestedProducts.map((line) => {
        const productId = String(line.product_id || line._id || '');
        const product = productsById.get(productId);

        if (!product) {
            throw orderError('One or more products are no longer available');
        }

        const quantity = Number(line.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
            throw orderError('Product quantity must be between 1 and 999');
        }

        const requestedSize = cleanText(line.size || line.selectedSize?.size, 80);
        const requestedPackage = cleanText(line.package || line.selectedSize?.package, 80);
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];

        const selectedSize =
            sizes.find((item) =>
                (!requestedSize || item.size === requestedSize) &&
                (!requestedPackage || item.package === requestedPackage)
            ) ||
            (!requestedSize && !requestedPackage
                ? sizes.find((item) => item.stock !== false && Number(item.price?.usd) > 0)
                : null);

        if (!selectedSize) {
            throw orderError(`Selected size is not available for ${product.title?.en || 'product'}`);
        }

        if (product.stock === false || selectedSize.stock === false) {
            throw orderError(`${product.title?.en || 'Product'} is out of stock`);
        }

        const price = Number(selectedSize.price?.usd);
        if (!Number.isFinite(price) || price <= 0) {
            throw orderError(`Price is not available for ${product.title?.en || 'product'}`);
        }

        return {
            product_id: product._id,
            quantity,
            price,
            size: cleanText(selectedSize.size, 80),
            package: cleanText(selectedSize.package, 80),
            number: String(product.number ?? ''),
        };
    });
};

export const createOrder = async (req, res) => {
    try {
        const { products, customer = {}, payment = 'cash', driver = false } = req.body;
        const name = cleanText(customer.name, 120);
        const submittedEmail = cleanText(customer.email, 160).toLowerCase();
        const email = submittedEmail.endsWith('@guest.whitebear.local')
            ? ''
            : submittedEmail;
        const phone = cleanText(customer.phone, 40);
        const address = cleanText(customer.address, 300);
        const requiresDelivery = driver === true;

        if (!name || !phone) {
            throw orderError('Customer name and phone are required');
        }

        if (phone.replace(/\D/g, '').length < 9) {
            throw orderError('Enter a valid phone number');
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw orderError('Enter a valid email address');
        }

        if (requiresDelivery && !address) {
            throw orderError('Delivery address is required');
        }

        if (!allowedPayments.has(payment)) {
            throw orderError('Unsupported payment method');
        }

        const requestedIds = Array.isArray(products)
            ? [...new Set(products.map((line) => String(line.product_id || line._id || '')))]
            : [];

        if (
            requestedIds.length === 0 ||
            requestedIds.some((id) => !mongoose.isValidObjectId(id))
        ) {
            throw orderError('Invalid products in cart');
        }

        const availableProducts = await Product.find({
            _id: { $in: requestedIds },
        }).lean();
        const verifiedProducts = prepareOrderProducts(products, availableProducts);
        const totalPrice = verifiedProducts.reduce(
            (total, line) => total + line.price * line.quantity,
            0
        );
        const generatedOrderId = `WB${Date.now().toString().slice(-8)}${Math.floor(
            10 + Math.random() * 90
        )}`;

        const newOrder = new Order({
            order_id: generatedOrderId,
            products: verifiedProducts,
            total_price: Number(totalPrice.toFixed(2)),
            customer: {
                name,
                email,
                phone,
                address: requiresDelivery ? address : '',
            },
            payment,
            driver: requiresDelivery,
        });

        await newOrder.save();
        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: status === 500 ? 'Failed to create order' : error.message,
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, payment } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }
        if (payment) {
            query.payment = payment;
        }

        const orders = await Order.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }).populate('products.product_id', 'title image');
        const totalOrders = await Order.countDocuments(query);

        res.status(200).json({
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            orders,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.payment_status = payment_status;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
};

export const assignDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { driver } = req.body;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.driver = driver;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to assign driver', error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete order', error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

export const getOrdersByCustomerEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const orders = await Order.find({ 'customer.email': email }).sort({ createdAt: -1 }).populate('products.product_id', 'title image');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};
