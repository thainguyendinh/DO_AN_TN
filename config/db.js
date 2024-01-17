import mongoose from "mongoose";
const connectDB= async ()=>{

    try {
        const conn=await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {  
        console.log(`Error: ${error.message}`.red.underline.bold);
    }
}
export default connectDB;