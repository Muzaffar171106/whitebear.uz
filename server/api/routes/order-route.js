
import express from 'express';
import { createOrder, getOrders, assignDriver, deleteOrder, getOrderById, getOrdersByCustomerEmail, updateOrderStatus, updatePaymentStatus } from '../controllers/order-controller.js';
import { verifyRole, isExisted } from "../../middlewares/isExisted.js";

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/customer/:email', getOrdersByCustomerEmail);
router.get('/:id', getOrderById);
router.put('/:id/status', isExisted, verifyRole('admin', 'super_admin'), updateOrderStatus);
router.put('/:id/payment', isExisted, verifyRole('admin', 'super_admin'), updatePaymentStatus);
router.put('/:id/driver', isExisted, verifyRole('admin', 'super_admin'), assignDriver);
router.delete('/:id', isExisted, verifyRole('admin', 'super_admin'), deleteOrder);

export default router;
