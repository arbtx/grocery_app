import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./SRC/models/index.js";
import { categories, products } from "./seedData.js";


async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        await Product.deleteMany({});
        await Category.deleteMany({});
        
        const categoryDocs = await Category.insertMany(categories);

        const categoryMap = categoryDocs.reduce((map, category)=>{
            map[category.name] = category._id;
            return map;
        }, {});

        const productsWithCategoryIds = products.map((product)=>({
            ...product,
            category: categoryMap[product.category],
            
          }));

        await Product.insertMany(productsWithCategoryIds);
        console.log("Database Seeded Successfully")
    
    }
    catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();