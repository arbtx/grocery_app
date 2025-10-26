import "dotenv/config";
import { connectDB } from "./SRC/config/connect.js";
import fastify from "fastify";
import { PORT } from "./SRC/config/config.js";
import { registerRoutes } from "./SRC/routes/index.js";
import fastifySocketIO from "fastify-socket.io";
import { buildAdminRouter } from "./SRC/config/setup.js";

const start = async () => {
  console.log("process.env.MONGO_URL:", process.env.MONGO_URL);
  await connectDB(process.env.MONGO_URL);
  const app = fastify();

  app.register(fastifySocketIO, {
    cors: {
      origin: "*", // Allow all origins
    },
    pingInterval: 10000, // 10 seconds
    pingTimeout: 5000, // 5 seconds
    transports: ["websocket"],
  });

  await registerRoutes(app);

  await buildAdminRouter(app);
  
  app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Grocery App is running on http://localhost:${PORT}`);
    }
  });

  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A user connected:");

      socket.on("joinRoom", (orderId) => {
        console.log(`User joined room: ${orderId}`);
        socket.join(orderId);
      });
    });
  });
};

start();
