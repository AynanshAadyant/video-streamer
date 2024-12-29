import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use( cors( {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}) ) //configuring cors

//app.use(...) => used to configure middllewares in express

app.use( express.json({ limit: "16kb"})) //configuring limits on incoming json

app.use( express.urlencoded({ extended: true, limit: "16kb" })) //encodes url and sets limit on url

app.use( express.static( "public" ))

app.use( cookieParser() ) //setting up cookie-parse, helps to perfom CRUD( Create Read Update Delete) operations on user Browser cookies securely

//importing router
import userRouter from "./routes/user.routes.js"

//router declaration : routes brought in using middleware
app.use( "/api/v1/users", userRouter)



export default app