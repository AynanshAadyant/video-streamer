import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connectDB = async () => {
    try {
        
        const connectionInstance = await mongoose.connect(`mongodb+srv://AynanshAadyant:Aynansh123@cluster0.ls7c6.mongodb.net/${DB_NAME}`)
        console.log( `\nDB connected :: DB_HOST : ${connectionInstance.connection.host}`)

    }
    catch( e ) {
        console.log( `MONGO DB CONNECTION ERROR: ${e}`)
        process.exit( 1 )
    }
}

export default connectDB