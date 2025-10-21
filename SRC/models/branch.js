import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },        
    },
    address: { type: String, required: true },
    deliveryPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' }],
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;