const express = require("express");
const {
  createAddress,
  getAddressById,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/address/new").post(isAuthenticatedUser, createAddress);

router.route("/getAddress").get(isAuthenticatedUser, getAddressById);

router.route("/address/:id").put(isAuthenticatedUser, updateAddress)
router.route('/address/:id').delete(isAuthenticatedUser, deleteAddress);

module.exports = router;
