import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler( async( req, res ) => {
    //registering user ::->
    //1. get user details from frontend
    //2. validation of data - like if fields not empty
    //3. check if user already exists : checking using username or email
    //4. check for images - check for avatar
    //5. if avatar available then uploading to cloudinary
    //6. create user object and create entry in DB
    //7. remove password and refresh token from response
    //8. checking for user creation 
    //9. return response

    //Getting in user details
    //getting in user details from frontend
    const { fullname, email, username, password } = req.body //destructuring the incoming data
    console.log( `Data fetched from fronted`)

    //validation
    //checking if fields are empty or not
    if( fullname === "" || email === "" || username === "" || password === "") {
        console.log( `field is empty`)
        throw new apiError( 400, "All fields required" )
    }
    console.log( `Checked for empty fields`)
    //checks if user exists or not 
    const existedUserUsername = await User.findOne( {username} )
    const existedUserEmail = await User.findOne( {email})
    if( existedUserUsername || existedUserEmail ) {
        throw new apiError( 409, "User still exists")
    }
    console.log( `checked for already existing users`)

    //checking if avatar and coverImage exists in local storage
    const avatarLocalPath =  req?.files?.avatar?.[0]?.path //checking if avatar exists in local storage or not, using conditional operator ?
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path //checking if coverImage exists in local storage or not
    console.log( `avatar local path: ${avatarLocalPath} , coverImageLocalPath: ${coverImageLocalPath}`)
    //checking if avatar file exists in local
    if( !avatarLocalPath ) {
        console.log( `avatarLocalPath not found`)
        throw new apiError( 400, "Avatar file required" )
    }
    //if avatar and coverImage available then uploading to cloudinary
    const avatar = await uploadOnCloudinary( avatarLocalPath )
    const coverImage = await uploadOnCloudinary( coverImageLocalPath )
    console.log( `avatar: ${avatar}, coverImage: ${coverImage}`)
    //checking if files successfully uploaded to cloudinary
    if( !avatar ) 
        throw new apiError( 400, "Avatar file not uploaded on Cloudinary")
    console.log( `checked if avatar exists or not in local storage`)

    //creating object to send to DB
    const user = await User.create( {
        fullname, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password, 
        username: username.toLowerCase()
    })
    console.log( `data sent to DB for user creation`)
    //checking if user is created or not
    const createdUser = await User.findById( user._id ).select( "-password -refreshToken" ).lean()//finding user by _id which is created by DB automatically on entry
    //fields removed from response by using .select( "-param1 -param2 ... ") which remove param1 and param2 from response
    //checking if user created is exisiting
    if( !createdUser ){
        throw new apiError( 500, "Something went wrong while creating user")
    }
    console.log( `User created in DB`)
    
    //sending response
    return res.status(201).json( 
        new apiResponse( 200, createdUser, "All systems OK")
    )
}
)

//function to generate access and refresh tokens
const generateTokens = async( userId ) => {
    try{
        const user = await User.findById( userId ) //accessing user from DB
        const accessToken = user.generateAccessToken() //generating access token for userID
        const refreshToken = user.generateRefreshToken() //generating refresh token for userID
        user.refreshToken = refreshToken //storing refresh token in user DB
        await user.save({ validateBeforeSave: false }) //saving changes in DB. validateBeforeSave tells the DB to save without any validation fields
        return {accessToken, refreshToken}
    }
    catch(e) {
        throw new apiError( 500, "Something went wrong while generating access and refresh token")
    }
}

const loginUser = asyncHandler( async( req, res ) => {
    //TODO in loginUser: 
    //1. get data from req.body
    //2. login using email or username
    //3. check for user in DB
    //4. if user present then enter password, if match then generate access token and refresh token, if no then deny
    //5. if password matches then generate access token and refresh token and send in cookie

    //taking out email, username, password for login
    const {email, username, password} = req.body
    //checking if email and username are present in req.body
    if( !email && !username )
    {
        throw new apiError( 400, "Username or email is required" )
    } 
    //finding out user in DB based on username or email
    const user = await User.findOne( {
        $or: [{username}, {email}]
    })
    //checking if user exists
    if( !user ) {
        throw new apiError( 404, "User does not exist" )
    }
    //password validation
    const isPasswordValid = await user.isPasswordCorrect(password)

    //check if password is valid
    if( !isPasswordValid ){
        throw new apiError( 401, "Password not matching")
    }

    //tokens
    //generating access and refresh tokens using custom function 
    const {accessToken, refreshToken} = await generateTokens( user._id ) //generating tokens for inbuilt _id for user

    //sending tokens into cookies
    const loggedInUser = await User.findOne( user._id ).select( "-password -refreshToken")
    //for cookies, designing options
    const options =  { //this configuration allows everyone to modify cookies in server
        httpOnly: true,
        secure: true
    }

    return res.status( 200 )
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options )
    .json( 
        new apiResponse( 200, 
            {
                user: loggedInUser,
                accessToken, 
                refreshToken
            },
            "User Logged in successfully"
        )
    )
})


const logOutUser = asyncHandler( async( req, res ) => {
    //TODO: 
    //clear cookies of user from server
    //when logout triggered then changing refreshToken to undefined
    await User.findByIdAndUpdate( req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options =  { //this configuration allows everyone to modify cookies in server
        httpOnly: true,
        secure: true
    }

    return res.status( 200 )
    .clearCookie( "accessToken", options )
    .clearCookie( "refreshToken", options )
    .json( new apiResponse(200, {}, "User Logged out successfully" ) ) 

})

const refreshAccessToken = asyncHandler( async( req, res ) => {
    //accessing user's refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    //checking if refresh token recieved or not
    if( !incomingRefreshToken) {
        throw new apiError( 401, "Unauthorised request" )
    }

    
    try{
        //decoding incoming refresh token
        const decodedRefreshToken = jwt.verify( incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET )

        //accessing user by use of _id from DB
        const user = await User.findById( decodedRefreshToken?._id)
        //checking if user is accessed correctly or not
        if( !user ) {
            throw new apiError( 401, "Invalid refresh token" )
        }
        //checking if incoming token matches with the DB token
        if(  incomingRefreshToken || user?.refreshToken) {
            throw new apiError( 401, "Refresh token is expired or used" )
        }

        const option = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generateTokens( user._id ) 

        return res.status( 200 )
        .cookie( "accessToken", accessToken, option )
        .cookie( "refreshToken", newRefreshToken, option )
        .json(
            new apiResponse( 200, {accessToken, newRefreshToken}, "Access Token refreshed")
        )
    }
    catch( e ) {
        throw new apiError( 401, error?.message || "Invalid refresh Token" )
    }
})




export {registerUser, loginUser, logOutUser, refreshAccessToken}