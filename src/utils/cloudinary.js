//file to setup cloudinary
//files are first stored in local server and then uploaded to cloudinary after which it is removed from the local server

import { v2  as cloudinary} from "cloudinary"
import fs from "fs" 

cloudinary.config({ 
    cloud_name: 'dl1nopfye', 
    api_key: '771532569661688', 
    api_secret: 'htSId3NGBb49BbXbeZ0BZsRmz0Y'
});

//console.log( process.env.CLOUDINARY_CLOUD_NAME, " " ,  process.env.CLOUDINARY_API_KEY, " " , process.env.CLOUDINARY_API_SECRET )



const uploadOnCloudinary = async (localFilePath) => {
    try{
        if( !localFilePath ){
            console.log( `local file path not found`)
            return null;
        }
        //if file exists then uploading to cloudinary
        console.log( `avatar: ${localFilePath} in line 19 of cloudinary.js`)
        const response = await cloudinary.uploader.upload( localFilePath, {
            resource_type: "auto"
        })
        console.log( `control at line 24 of cloudinary.js`)
        //file uploaded successfully
        console.log( "file uploaded to cloudinary successfully", response.url )
        return response
    }
    catch(e) {
        fs.unlinkSync(localFilePath) //removes locally saved temporary file as upload option got failed
        console.log( `error in cloudinary file`)
        return null 
    }
}

export {uploadOnCloudinary}