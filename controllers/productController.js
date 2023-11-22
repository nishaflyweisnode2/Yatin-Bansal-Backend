const Product = require("../models/productModel");
const ObjectId = require("mongodb").ObjectID;
const cloudinary = require('cloudinary').v2;
const Wishlist = require("../models/WishlistModel");
const mongoose = require("mongoose");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

const { multipleFileHandle } = require("../utils/fileHandle");


cloudinary.config({
  cloud_name: "dvwecihog",
  api_key: '364881266278834',
  api_secret: '5_okbyciVx-7qFz7oP31uOpuv7Q'
});


// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    let images = [];
    let leaselistingPicture = []
    if (req.files && req.files.length > 0) {
      leaselistingPicture = req.files.map((file) => {
        return { path: file.path, filename: file.filename };
      });

      const uploadPromises = leaselistingPicture.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, { public_id: image.filename });
        return result
      });
      const Images = await Promise.all(uploadPromises);
      for (var i = 0; i < Images.length; i++) {
        images.push({ img: Images[i].url })
      }
    }
    const data = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      ratings: req.body.ratings,
      images,
      size: req.body.size,
      colors: req.body.colors,
      category: req.body.category,
      subCategory: req.body.category,
      Stock: req.body.Stock,
      numOfReviews: req.body.numOfReviews,
      user: req.body.user,
      reviews: req.body.reviews
    }
    const product = await Product.create(data);

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    next(error);
  }
});

// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 50;
  const productsCount = await Product.countDocuments();
  let demoProduct = await Product.aggregate([
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

  const apiFeature = new ApiFeatures(Product.find().populate("category subCategory"), req.query).search().filter();
  let products = await apiFeature.query;

  let filteredProductsCount = products.length;

  apiFeature.pagination(resultPerPage);

  return res.status(200).json({
    success: true,
    products,
    demoProduct,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find().populate("category");

  return res.status(200).json({
    success: true,
    products,
  });
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

// Update Product -- Admin

exports.updateProduct1 = catchAsyncErrors(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }

    // Images Start Here
    console.log(req.body.images)
    let images = [];

    if (req.body.images) {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    // if (images !== undefined) {
    //   // Deleting Images From Cloudinary
    //   for (let i = 0; i < product.images.length; i++) {
    //     await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    //   }

    //   const imagesLinks = [];

    //   for (let i = 0; i < images.length; i++) {
    //     const result = await cloudinary.v2.uploader.upload(images[i], {
    //       folder: "products",
    //     });

    //     imagesLinks.push({
    //       public_id: result.public_id,
    //       url: result.secure_url,
    //     });
    //   }

    //   req.body.images = imagesLinks;
    // }

    product = await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    }, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    })
  }
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle image updates
    let images = existingProduct.images || [];
    let leaselistingPicture = [];
    if (req.files && req.files.length > 0) {
      leaselistingPicture = req.files.map((file) => {
        return { path: file.path, filename: file.filename };
      });

      const uploadPromises = leaselistingPicture.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, { public_id: image.filename });
        return { img: result.url };
      });
      const updatedImages = await Promise.all(uploadPromises);

      images = updatedImages;
    }

    // Update the product data
    if (req.body.name) {
      existingProduct.name = req.body.name;
    }
    if (req.body.description) {
      existingProduct.description = req.body.description;
    }
    if (req.body.price) {
      existingProduct.price = req.body.price;
    }
    if (req.body.category) {
      existingProduct.category = req.body.category;
    }
    if (req.body.size) {
      existingProduct.size = req.body.size;
    }
    if (req.body.ratings) {
      existingProduct.ratings = req.body.ratings;
    }
    if (req.body.subCategory) {
      existingProduct.subCategory = req.body.subCategory;
    }
    if (req.body.Stock) {
      existingProduct.Stock = req.body.Stock;
    }
    if (req.body.user) {
      existingProduct.user = req.body.user;
    }
    if (req.body.reviews) {
      existingProduct.reviews = req.body.reviews;
    }

    existingProduct.images = images;

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    return res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    next(error);
  }
});



// Delete Product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById({ _id: req.params.productId });

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // Deleting Images From Cloudinary
  await product.remove();

  return res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const reviews = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(reviews);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  return res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  return res.status(200).json({
    success: true,
  });
});


exports.createWishlist = catchAsyncErrors(async (req, res, next) => {
  const product = req.params.id;
  //console.log(user)
  let wishList = await Wishlist.findOne({ user: req.user._id });
  if (!wishList) {
    wishList = new Wishlist({
      user: req.user,
    });
  }
  wishList.products.addToSet(product);
  await wishList.save();
  return res.status(200).json({
    message: "product addedd to wishlist Successfully",
  });
});

exports.removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return next(new ErrorHander("Wishlist not found", 404));
  }
  const product = req.params.id;

  wishlist.products.pull(new mongoose.Types.ObjectId(product));

  await wishlist.save();
  return res.status(200).json({
    success: true,
    message: "Removed From Wishlist",
  });
});
exports.myWishlist = catchAsyncErrors(async (req, res, next) => {
  let myList = await Wishlist.findOne({ user: req.user._id }).populate(
    "products"
  );

  if (!myList) {
    myList = await Wishlist.create({
      user: req.user._id,
    });
  }
  return res.status(200).json({
    success: true,
    wishlist: myList,
  });
});
exports.getProductByCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const producyBycategory = await Product.find({ category: req.params.id })

    return res.status(200).json({
      message: "get Successfully",
      data: producyBycategory
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
})
exports.paginateProductSearch = async (req, res) => {
  try {
    const { search, fromDate, toDate, category, subCategory, status, page, limit } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { "name": { $regex: req.query.search, $options: "i" }, },
        { "description": { $regex: req.query.search, $options: "i" }, },
      ]
    }
    if (status) {
      query.status = status
    }
    if (subCategory) {
      query.subCategory = subCategory
    }
    if (category) {
      query.category = category
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: Number(page) || 1,
      limit: Number(limit) || 15,
      sort: { createdAt: -1 },
      populate: ('category subCategory')
    };
    let data = await Product.paginate(query, options);
    return res.status(200).json({ status: 200, message: "Product data found.", data: data });

  } catch (err) {
    return res.status(500).send({ msg: "internal server error ", error: err.message, });
  }
};
exports.getNewArrival = async (req, res, next) => {
  try {
    const productsCount = await Product.count();
    if (req.query.search != (null || undefined)) {
      let data1 = [
        {
          $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" },
        },
        { $unwind: "$category" },
        {
          $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "subCategory", },
        },
        { $unwind: "$subCategory" },
        {
          $match: {
            $or: [
              { "category.name": { $regex: req.query.search, $options: "i" }, },
              { "subCategory.subCategory": { $regex: req.query.search, $options: "i" }, },
              { "name": { $regex: req.query.search, $options: "i" }, },
              { "description": { $regex: req.query.search, $options: "i" }, },
            ]
          }
        },
        { $sort: { createdAt: -1 } }
      ]
      let apiFeature = await Product.aggregate(data1);
      return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
    } else {
      let apiFeature = await Product.aggregate([
        {
          $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" },
        },
        { $unwind: "$category" },
        {
          $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "subCategory", },
        },
        { $unwind: "$subCategory" },

        { $sort: { createdAt: -1 } }
      ]);

      return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error while creating Product", });
  }
};
exports.getDemand = async (req, res, next) => {
  try {
    const productsCount = await Product.count();
    if (req.query.search != (null || undefined)) {
      let data1 = [
        {
          $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" },
        },
        { $unwind: "$category" },
        {
          $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "subCategory", },
        },
        { $unwind: "$subCategory" },
        {
          $match: {
            $or: [
              { "category.name": { $regex: req.query.search, $options: "i" }, },
              { "subCategory.subCategory": { $regex: req.query.search, $options: "i" }, },
              { "name": { $regex: req.query.search, $options: "i" }, },
              { "description": { $regex: req.query.search, $options: "i" }, },
            ]
          }
        },
        { $sort: { createdAt: -1 } }
      ]
      let apiFeature = await Product.aggregate(data1);
      return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
    } else {
      let apiFeature = await Product.aggregate([
        {
          $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" },
        },
        { $unwind: "$category" },
        {
          $lookup: { from: "subcategories", localField: "subCategory", foreignField: "_id", as: "subCategory", },
        },
        { $unwind: "$subCategory" },

        { $sort: { createdAt: -1 } }
      ]);

      return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error while creating Product", });
  }
};