import mongoose from "mongoose";

const databaseConnection = async () => {
    try {
        const connectionInstance = await mongoose.connect("mongodb://127.0.0.1:27017/digitalWallet?replicaSet=rs0", { family: 4 });
        console.log(`Mongoose connected: ${connectionInstance.connection}`);
    } catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default databaseConnection;