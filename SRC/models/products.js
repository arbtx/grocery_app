import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String },
    price: { type: Number, required: true},
    discountPrice: { type: Number }, 
    quantity: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    imageUrl: { type: String, required: true },
})  ;

const Product = mongoose.model('Product', productSchema);

export default Product;