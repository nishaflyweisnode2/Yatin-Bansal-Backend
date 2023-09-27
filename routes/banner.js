const router = require("express").Router();
const banner = require('../controllers/banner')
const authConfig = require("../configs/auth.config");
var multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "jitender/images/Banner", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), banner.AddBanner);
router.get('/all', banner.getBanner);
router.get('/get/:id', banner.getById);
router.delete('/delete/:id', banner.DeleteBanner);



module.exports = router;