import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      // In a real app, you might want to use a library like `uuid` to generate unique filenames
      // For now, we'll use the original name with a timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
  })
  
export const upload = multer({ storage });