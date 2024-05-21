import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import colors from 'colors';
mongoose.set('strictQuery', true);
const uri = process.env.MONGO_URI;

const connectDB = async () => { 


try {
    const conn = await mongoose.connect(uri)
    console.log(`MongoDB Connected: ${conn.connection.host}`.yellow.bold)

   // console.log("I am testing the route to the database I need to add a white list but first need a vpn before I can connect")
    
} catch (error) {

    console.error(`Error from the database: ${error.message}`.red.bold)
    process.exit(1)
    
}

}

export default connectDB;