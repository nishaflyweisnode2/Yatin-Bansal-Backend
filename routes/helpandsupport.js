const express = require('express');
const help = require('../controllers/helpandsupport');
const auth = require('../middleware/auth');
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/driverauth");


const router = express();

router.post('/user/help', auth.isAuthenticatedUser, help.AddQuery);
router.get('/user/help', help.getAllHelpandSupport);
router.get('/user/help', auth.isAuthenticatedUser, help.getAllHelpandSupportgetByuserId);
router.delete('/delete/:id', help.DeleteHelpandSupport);
router.post('/driver/help', isAuthenticatedUser, help.AddQuery);


module.exports = router;

