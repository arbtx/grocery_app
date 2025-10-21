import mongoose from "mongoose";
import Counter from "./counter.js";



const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    items: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        count: { type: Number, required: true, min: 1},

    },
 ],
    deliveryLocation: { latitude: { type: Number, required: true }, longitude: { type: Number, required: true}, address: { type: String, required: true } },
    pickupLocation: { latitude: { type: Number, required: true }, longitude: { type: Number, required: true}, address: { type: String, required: true } },
    deliveryPartnerLocation: { latitude: { type: Number }, longitude: { type: Number }, address: { type: String}},

    status: { type: String, enum: ['Pending', 'Accepted', 'In Transit', 'Delivered', 'Cancelled'], default: 'Pending' },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now },

})

async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { name: sequenceName },
        { $inc: { sequenceValue: 1 } },
        {new: true, upsert: true});
        return sequenceDocument.sequenceValue;
    }

orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const sequenceValue = await getNextSequenceValue('orderId');
        this.orderId = `ORD-${sequenceValue.toString().padStart(6, '0')}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
