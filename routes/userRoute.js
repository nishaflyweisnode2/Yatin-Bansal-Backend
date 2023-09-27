const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const auth = require("../middleware/driverauth");
const { otpLimiter } = require("../middleware/rateLimiter");
var multer = require("multer");
const authConfig = require("../configs/auth.config");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
  signInWithGoogle,
  accountVerificationOTP,
  passwordResetOtp,
  sendOtp,
  loginVendor,
  registerVonder,
  AddUser,
  ChagePaymentStatus,
  GetALlSubdomain,
  AddQuery,
  getAllHelpandSupport,
  getAllHelpandSupportgetByuserId,
  DeleteHelpandSupport,
  updateNotifactionStatus,
  updateOrderHistory,
  updatePopup
} = require("../controllers/userController");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "jitender/images/product", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
const router = express.Router();

// router.route("/sendOTP").post(otpLimiter, sendOTP);

router.route("/verifyRegistration/:id").post(accountVerificationOTP);

router.route("/googleAuth").post(signInWithGoogle);

router.route("/register").post(registerUser);
router.route('/sendotp').post(sendOtp);
router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/verify-otp").post(passwordResetOtp)

router.route("/password/reset/:id").post(resetPassword);

router.route("/logout").get(logout);

router.route('/subadmin').get(GetALlSubdomain)

router.route("/me/:id").get(getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, upload.single('image'), updateProfile);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, getAllUser);

router.route('/vender/login').post(loginVendor)
router.route('/vendor/register').post(registerVonder)

router.route('/user/paymentstatus/:id').post(ChagePaymentStatus)

router.route("/admin/addUser").post(AddUser);
router
  .route("/admin/user/:id")
  .get(getSingleUser)
  .put(updateUserRole)
  .delete(deleteUser)

router.post('/user/help', isAuthenticatedUser, AddQuery);
router.get('/user/help', getAllHelpandSupport);
router.get('/user/help', isAuthenticatedUser, getAllHelpandSupportgetByuserId);
router.delete('/delete/:id', DeleteHelpandSupport);
router.post('/driver/help', auth.isAuthenticatedUser, AddQuery);
router.put('/user/updateNotifactionStatus', isAuthenticatedUser, updateNotifactionStatus);
router.put('/user/updatePopup', isAuthenticatedUser, updatePopup);
router.put('/user/updateOrderHistory', isAuthenticatedUser, updateOrderHistory);

module.exports = router;


