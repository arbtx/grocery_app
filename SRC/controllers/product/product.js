import { Product } from "../../models/index.js";


export const getProductsByCategoriesId = async (req, reply) => {
    const {categoryId} = req.params;

    try {
        const products = await Product.find({category: categoryId})
          .select("-category") //removing a particular category
          .exec(); //gets products from a particular category

        return reply.send(products);
    } catch (error) {
        return reply.code(500).send({message: 'Internal Server Error', error});
    }
}   