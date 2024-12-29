import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"

dotenv.config( )

connectDB()
.then( () => {
    app.listen( process.env.PORT || 3300 , () => {
        console.log( `SERVER IS RUNNING AT PORT: ${process.env.PORT || 3300 }`)
    })
}) 
.catch( (err) => {
    console.log( "MongoDB connection failed", err )
})





/* Approach 1
import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect( `${process.env.MONGO_URI}/${DB_NAME}`)
        app.on( "error", ( err ) => {
            console.log( "ERR: ", err )
            throw err
        })

        app.listen( process.env.PORT, () => {
            console.log( `App listening on PORT:${process.env.PORT}`)
        } )
    }
    catch( e ) {
        console.log("ERROR:", e )
        throw e
    }
})() //ifi function - instantaneously called function connect database
//the async function is required as connection to DB takes time as "DB is in another continent". so it is good practice to await DB.connect

*/