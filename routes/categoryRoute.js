const express = require("express");
const authConfig = require("../configs/auth.config");
const {
  createCategory,
  getCategories,
  createSubCategory,
  DeleteCategory,
  TotalCategory,
  updateCategory,
  updateSubCategory,
  getSubCategory
} = require("../controllers/categoryController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
var multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "jitender/images/product", allowed_formats: ["jpg", "avif", "jpeg", "webp", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });

const router = express.Router();

router.route("/admin/category/new").post(upload.single('image'), createCategory,);

router.route('/admin/category/update/:id').put(upload.single('image'), updateCategory)

router.route("/admin/subCategory/new").post(upload.single('image'), createSubCategory)
router.route("/admin/subCategory/update/:id").put(upload.single('image'), updateSubCategory)
router.route("/admin/subCategory/getAllsubCategory/:Category").get(getSubCategory);

router.route("/catogory/getAllCategory").get(getCategories);

router.route('/admin/delete/cat/:id').delete(DeleteCategory)


router.route('/admin/total/cat').get(TotalCategory);

module.exports = router;
