import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const UserSchema = mongoose.Schema( {
    username: {
        type: String,
        required: true, 
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: false
    },
    watchHistory:  [ {
        type: mongoose.Schema.ObjectId,
        ref: "Video"
    } ],
    password: {
        type: String, 
        required: [ true, "password is requried"]
    },
    refreshToken: {
        type: String
    }

}, { timestamps: true} )

//function to encrypt password when saving data for the first time
UserSchema.pre( "save", async function( next ) {
    if( !this.isModified( "password" )) //this code makes sure that the password is hashed for the first time only and password is hashed only when password is modified or saved. this.isModified( ... ) is a default function to check if the passed parameter has been modified or not 
        return next()
    this.password = await bcrypt.hash( this.password, 10 ) //hashing function which hashes password of the current field using .hash( ..., rounds ) using bcrypt inbuild hash()
    next()
})

//function used to check if hashed password is correct or not 
UserSchema.methods.isPasswordCorrect = async function( password ) { //async function as time is taken in cryptography
     return await bcrypt.compare( password, this.password) //.compare( data, param ) is an inbuilt function which compare data and param where data is the normal parameter and param is the cryptographed parameter. it returns true or false as a promise.    
}

//function to generate access tokens
UserSchema.methods.generateAccessToken = function() {
    return jwt.sign( {
        _id: this.id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

//function to generate refresh tokens
UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign( {
        _id: this.id
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model( "User", UserSchema )