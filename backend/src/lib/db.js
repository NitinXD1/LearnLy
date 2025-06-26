import mongoose from 'mongoose'


export const connectDB = async() => {
    try {
        const res = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database is connected successfully : ${res.connection.host}`)
    } catch (error) {
        console.log('Error in database connection')
        process.exit(1);
    }
} 