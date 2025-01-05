//this middleware verifies if user is present or not
import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"


export const verifyJWT = asyncHandler( async( req, res, next ) => {
    try{
        const token = req.cookies?.accessToken || req.header( "Authorization")?.replace( "Bearer", "" )  //access cookies of request or header
    //checking if cookie or header has been accessed or not and throwing appropriate error message
    if( !token ) {
        throw new apiError( 401, "Unauthorized request" ) 
    }
    //decoding tokens using jwt
    const decodedToken = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById( decodedToken?._id).select("-password -refreshToken")
    //checking if valid token or not
    if( !user )
    {
        throw new apiError( 401, "Invalid access token" )
    }

    req.user = user

    next()
    }
    catch( e ) {
        throw new apiError( 401, error?.message || "Invalid access token")
    }
})