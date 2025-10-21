import {
    confirmOrder, createOrder, getOrderById, getOrders, updateOrderStatus,

} from '../controllers/order/order.js';
import { verifyToken } from '../middleware/auth.js';

export const orderRoutes = async (fastify, options) => {
    fastify.addhook('preHandler', async (request, reply) => {
        const isAuthenticated = await verifyToken(request, reply);
        if (!isAuthenticated) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
});

    fastify.post('/orders', createOrder);
    fastify.get('/orders', getOrders);
    fastify.patch('/orders/:orderId/status', updateOrderStatus);
    fastify.post('/orders/:orderId/confirm', confirmOrder);
    fastify.get('/orders/:orderId', getOrderById);
};
