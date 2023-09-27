const Product = require("../models/productModel");
const User = require("../models/userModel");
const Vender = require("../models/vendorModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");

// Create Product -- Vender
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [], size = [];
  console.log(req.body);
  for (let i = 0; i < req.files.length; i++) {
    let obj = {
      img: req.files[i].path
    }
    images.push(obj)
  }
  if (req.body.size != (null || undefined)) {
    if (req.body.size.length > 0) {
      for (let i = 0; i < req.body.size.length; i++) {
        let obj = {
          size: req.body.size[i]
        }
        size.push(obj)
      }
      req.body.size = size;
    }
  }
  req.body.images = images;
  req.body.user = req.user.id;
  req.body.subCategory = req.body.subCategory;
  const product = await Product.create(req.body);

  return res.status(201).json({
    success: true,
    product,
  });
});

// Fetch Product By Vender
exports.singleVenderProducts = catchAsyncErrors(async (req, res, next) => {
  const { venderId } = req.params;

  let venderProduct = await Product.aggregate([
    {
      $match: { _id: venderId },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        ratings: 1,
        review: 1,
        category: "$category.parentCategory",
      },
    },
  ]);

  res.status(200).json({
    venderProduct,
  });
});

// Register Vender
exports.registerVender = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "vender",
  });

  const vender = await Vender.create({
    user: user._id,
  });

  sendToken(user, 201, res);
});

// Login Vender
exports.venderLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const vender = await User.findOne({ email }).select("+password");

  if (!vender) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await vender.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(vender, 200, res);
});

exports.registerVenderByAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "vender",
  });

  const vender = await Vender.create({
    user: user._id,
  });

  sendToken(user, 201, res);
});


// Get All Vender - Admin
exports.getAllVender = catchAsyncErrors(async (req, res, next) => {
  const venders = await User.find({ role: "vender" });

  res.status(200).json({ success: true, venders });
});

// Get Single Vender Details - Admin
exports.singleVender = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const vender = await User.findById(id);

  if (!vender) return next(new ErrorHander("Vender Not Found !", 401));

  res.status(200).json({
    success: true,
    vender,
  });
});

// Get Vender Details (me)
exports.getVenderDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const vender = await User.findById(id);

  if (!vender) return next(new ErrorHander("Vender Not Found ! Invalid id"));

  res.status(200).json({
    success: true,
    vender,
  });
});


exports.DeleteVendor = async (req, res) => {
  try {
    await User.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json({
      message: "ok",
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}

exports.getAllVender = async (req, res) => {
  try {
    const data = await User.find({ role: "vender" });
    res.status(200).json({
      message: "ok",
      data: data
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}
// Update Vender Detail
exports.updateVender = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  const vender = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});


exports.updateVenderByAdmin = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  const vender = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});



// Change Vender Status - Admin
exports.changeVenderStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findById({ _id: req.params.id });
  console.log(user)

  const vender = await Vender.findOne({ user: user._id });

  if (!vender) return next(new ErrorHander("Vender Not Found ! Invalid Id"));

  vender.isVerified = !vender.isVerified;
  console.log(user.verified)
  if (user.verified === false) {
    user.verified = true
    user.save()
  } else {
    console.log("fale")
    user.verified = false
    user.save()
  }
  vender.save();

  res
    .status(200)
    .json({ success: true, message: "Status Updated Successfully" });
});
