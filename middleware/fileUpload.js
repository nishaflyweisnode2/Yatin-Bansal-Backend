// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.originalname.replace(" ", "-") +
//         "-" +
//         uniqueSuffix +
//         path.extname(file.originalname)
//     );
//   },
// });



// const upload = multer({ storage: storage });

// module.exports = upload;





const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: 'https-www-pilkhuwahandloom-com',
  api_key: '886273344769554',
  api_secret: 'BVicyMGE04PrE7vWSorJ5txKmPs'
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images/image",
    allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
  },
});
const upload = multer({ storage: storage });


module.exports = upload;