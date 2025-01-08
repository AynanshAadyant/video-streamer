import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import {Video} from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const uploadVideo = asyncHandler( async( req, res ) => {

    const { title, description, isPublished } = req.body
    const owner = req.user
    if( !owner ){
        throw new apiError( 400, "User not logged in" )
    }
    const videoFileLocalPath = req?.files?.videoFile?.path
    const thumbNailLocalPath = req?.files?.thumbnail?.path

    if( !videoFileLocalPath ) {
        throw new apiError( 400, "Video not present" )
    }

    const videoFile = await uploadOnCloudinary( videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary( thumbNailLocalPath)

    if( !videoFile )
    {
        throw new apiError( 400, "Video not uploaded to cloudinary" )
    }

    const video = Video.create( {
        videoFile: videoFile.url,
        thumbnail: thumbnail.url || "",
        title,
        description,
        isPublished,
        owner: this.owner
    })

    const createdVideo = Video.findById( video._id ).lean()

    if( !createdVideo )
    {
        throw new apiError( 400, "Something went wrong while created Video")
    }

    return res.status( 200 )
    .json( new apiResponse( 200, createdVideo, "Video uploaded successfully") )


})


export {uploadVideo}