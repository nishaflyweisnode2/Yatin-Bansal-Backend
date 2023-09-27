const express = require("express");
const {
  registerVender,
  venderLogin,
  createProduct,
  getVenderDetails,
  changeVenderStatus,
  updateVender,
  singleVenderProducts,
  DeleteVendor,
  getAllVender,
  updateVenderByAdmin,
  registerVenderByAdmin
} = require("../controllers/venderController");
const authConfig = require("../configs/auth.config");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
var multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "jitender/images/product", allowed_formats: ["jpg", "jpeg", "avif", "webp", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
const router = express.Router();

router.route("/register").post(registerVender);

router.route("/login").post(venderLogin);

router.route('/all').get(getAllVender)

router.route("/product/new").post(isAuthenticatedUser, upload.array('image'), createProduct);

router
  .route("/products")
  .get(isAuthenticatedUser, authorizeRoles("vender"), singleVenderProducts);

router
  .route("/:id")
  .get(isAuthenticatedUser, authorizeRoles("vender"), getVenderDetails)
  .put(isAuthenticatedUser, authorizeRoles("vender"), updateVender);


router.route('/add')
  .post(isAuthenticatedUser, authorizeRoles("admin"), registerVenderByAdmin)

//router.route('/all').get(isAuthenticatedUser, authorizeRoles('admin'), getAllVender)

router
  .route("/status/:id")
  .put(changeVenderStatus)
  .patch(updateVenderByAdmin)
  .delete(DeleteVendor)
module.exports = router;
