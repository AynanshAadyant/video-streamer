//route for registerUser

import { Router } from "express";
import { registerUser } from "../controllers/user.controller"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route( "/register" ).post( upload.fields(     //putting in middleware multer before registerUser controller
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
),
    registerUser )

export default router