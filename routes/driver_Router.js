const express = require('express');
const driver_Controllers = require('../controllers/driver_controllers')
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/driverauth");
const router = express();
const authConfig = require("../configs/auth.config");
var multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "jitender/images/product", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
router.post('/sendotp', driver_Controllers.sendOtp);
router.post('/verify/:id', driver_Controllers.accountVerificationOTP);
router.get('/profile/:id', driver_Controllers.getUserDetails);
router.put('/update', isAuthenticatedUser, upload.single('image'), driver_Controllers.AddDeriverDetails);
router.post('/addOrder', driver_Controllers.AssignOrdertoDriver);
router.post('/accept/:id', driver_Controllers.DriverAccept);
router.post('/reject/:id', driver_Controllers.DriverReject);
router.get('/alldriver', driver_Controllers.AllDrivers);
router.get('/allorders', isAuthenticatedUser, driver_Controllers.DriverAllOrder)
router.delete('/delete/order/:id', driver_Controllers.DeleteAssignOrder);
router.get('/price', isAuthenticatedUser, driver_Controllers.GetPriceByDriverId);
router.post('/complete/:id', driver_Controllers.DeliveredOrder);
router.post('/logout', driver_Controllers.logout);
router.get('/delivered/:driverId', driver_Controllers.driverCompleted)
router.get('/pending/order/:id', driver_Controllers.PendingOrder)
router.get('/accept/order/:id', driver_Controllers.AcceptOrder)
router.delete('/:id', driver_Controllers.DeleteDriver);
router.post('/status/:id', driver_Controllers.ChangeStatus)
router.get('/DeliveredEarning', isAuthenticatedUser, driver_Controllers.DeliveredEarning)
router.put('/updateCommission/:id', driver_Controllers.updateCommission)
router.put('/updateNotifactionStatus', isAuthenticatedUser, driver_Controllers.updateNotifactionStatus);
router.put('/updateDutyStatus', isAuthenticatedUser, driver_Controllers.updateDutyStatus);

module.exports = router;