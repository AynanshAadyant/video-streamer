import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log( `inside destination`)
      cb(null, './public/temp') //stores files temporarily in public folder
    },
    filename: function (req, file, cb) {
      console.log( `inside filename of multer`)
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ 
    storage,
 })

 export default upload
