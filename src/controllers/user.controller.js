import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

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
    console.log( `email:${email}`)

    //validation
    //checking if fields are empty or not
    if( fullname === "" || email === "" || username === "" || password === "") {
        throw new apiError( 400, "All fields required" )
    }
    //checks if user exists or not 
    const existedUserUsername = User.findOne( {username} )
    const existedUserEmail = User.findOne( {email})
    if( existedUserUsername || existedUserEmail ) {
        throw new apiError( 409, "User still exists")
    }

    //checking if avatar and coverImage exists in local storage
    const avatarLocalPath =  req.files?.avatar[0]?.path  //checking if avatar exists in local storage or not, using conditional operator ?
    const coverImageLocalPath = req.files?.coverImage[0]?.path //checking if coverImage exists in local storage or not
    //checking if avatar file exists in local
    if( !avatarLocalPath ) 
        throw new apiError( 400, "Avatar file required" )
    //if avatar and coverImage available then uploading to cloudinary
    const avatar = await uploadOnCloudinary( avatarLocalPath )
    const coverImage = await uploadOnCloudinary( coverImageLocalPath )
    //checking if files successfully uploaded to cloudinary
    if( !avatar ) 
        throw new apiError( 400, "Avatar file not uploaded on Cloudinary")

    //creating object to send to DB
    const user = await User.create( {
        fullname, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password, 
        username: username.toLowerCase()
    })
    //checking if user is created or not
    const createdUser = user.findById( user._id ).select(
        "-password -refreshToken"
    ) //finding user by _id which is created by DB automatically on entry
    //fields removed from response by using .select( "-param1 -param2 ... ") which remove param1 and param2 from response
    //checking if user created ir bit 
    if( !createdUser ){
        throw new apiError( 500, "Something went wrong while creating user")
    }

    //sending response
    return res.status(201).json( 
        new apiResponse( 200, createdUser, "UserRegistered successfully")
    )
    })





export {registerUser}