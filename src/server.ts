import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";
import config from "./config";
import { Server } from "http";

let server: Server;
async function main() {
    try {        
        await prisma.$connect();
        console.log("Connected to the database successfully.");
        server = app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
       }) 
    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection detected, shutting down...', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception detected, shutting down...', err);
  process.exit(1);
});