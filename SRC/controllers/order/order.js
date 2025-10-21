import Order from '../../models/order.js';
import Branch from "../../models/branch.js"
import {Customer, DeliveryPartner} from '../../models/user.js';

export const createOrder = async (req, res) => {
    try {
      const {userId} = req.user;
      const {items, branch, totalPrice} = req.body;
    
      const customerData = await Customer.findOne({userId});
      const branchData = await Branch.findById(branch);
        if (!customerData) {
          return reply.status(404).send("Customer not found");
        }

        const newOrder = new Order({
            customer: userId,
            items: items.map((item)=>({
                id: item.id,
                count: item.count
            })),
            branch: branchData._id,
            totalPrice,
            deliveryLocation:{
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || "No address provided",
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || "No address provided",
            }
        });


        const savedOrder = await newOrder.save();
        return reply.status(201).send(savedOrder);

    } catch (error) {
        console.log(error);
        return reply.status(500).send("Failed to create order");
    }

  }

export const confirmOrder = async (req, res) => {
    try {
        const {userId} = req.user;
        const {orderId} = req.params;
        const {deliveryPartnerLocation} = req.body;
        const deliveryPerson = await DeliveryPartner.findOne({userId});
        if (!deliveryPerson) {
            return reply.status(404).send("Delivery partner not found");
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send("Order not found");
        }
        if (order.status !== 'PENDING') {
            return reply.status(400).send("Order is not in a confirmable state");
        }   
        order.status = 'CONFIRMED';

        order.deliveryPartner = userId;
        order.deliveryPartnerLocation = {
            latitude: deliveryPartnerLocation.latitude,
            longitude: deliveryPartnerLocation.longitude,
            address: deliveryPartnerLocation.address || "No address provided",
        };  

        req.server.io.to(orderId).emit('orderConfirmed', order);
        await order.save();

        return reply.send(order);

    }
    catch (error) {
        return reply.status(500).send("Failed to confirm order", error);
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const {userId} = req.user;
        const {orderId} = req.params;
        const {status, deliveryPartnerLocation} = req.body;
        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return reply.status(404).send("Delivery partner not found");
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send("Order not found");
        }
        if (["cancelled", "delivered"].includes(order.status)) {
            return reply.status(400).send("Order cannot be updated");
        }

        if (order.deliveryPartner.toString() !== userId) {
            return reply.status(403).send("You are not assigned to this order");
        }
        order.status = status;
        order.deliveryPersonLocation = deliveryPersonLocation;
        await order.save();
        req.server.io.to(orderId).emit('orderStatusUpdated', order);

        return reply.send(order);
    }
    catch (error) {
        return reply.status(500).send("Failed to update order status", error);
    }
}

export const getOrders = async (req, res) => {
    try {
        const {status, customerId, deliveryPartner, branchId} = req.user;
        let query = {};
        if (status) {query.status = status;}
        if (customerId) {query.customer = customerId;}
        if (deliveryPartnerId) {query.deliveryPartner = deliveryPartnerId;
        query.branch = branchId;}

        const orders = await Order.find(query).populate("Customer branch items.item deliveryPartner");
        return reply.send(orders); //populate provides name , phone number of the  customer.
    }
    catch (error) {
        return reply.status(500).send("Failed to fetch orders", error);
    }
};

export const getOrderById = async (req, res) => {
    try{
        const {orderId} = req.params;
        const order = await Order.findById(orderId).populate("customer branch items.item deliveryPartner");
        if (!order) {
            return reply.status(404).send("Order not found");
        }
        return reply.send(order);
    }
    catch (error) {
        return reply.status(500).send("Failed to fetch order", error);
    }
}
