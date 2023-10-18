const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Category = require("../models/CategoryModel");
const SubCategory = require("../models/SubCategory");
const { singleFileHandle } = require("../utils/fileHandle");


exports.createCategory = catchAsyncErrors(async (req, res, next) => {
  let image;
  if (req.file) {
    image = req.file.path
  }

  const data = {
    name: req.body.name,
    image: image
  }
  console.log(data)
  const category = await Category.create(data);
  return res.status(201).json({ success: true, category, });
});

exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();
  return res.status(201).json({
    success: true,
    categories,
  });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) new ErrorHander("Category Not Found !", 400);
  let image;
  if (req.file) {
    image = req.file.path
  }
  category.name = req.body.name || category.name;
  category.image = image || category.image;
  await category.save();

  return res.status(200).json({ message: "Updated Successfully" });
});

exports.removeCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) new ErrorHander("Category Not Found !", 404);

  const subCategory = await SubCategory.find({ parentCategory: id });

  subCategory.map(
    async (item) => await SubCategory.deleteOne({ _id: item.id })
  );

  category.remove();

  return res.status(200).json({ message: "Category Deleted Successfully !" });
});

exports.createSubCategory = async (req, res) => {
  try {
    const data = await Category.findById(req.body.categoryId);
    if (!data || data.length === 0) {
      return res.status(400).send({ status: 404, msg: "not found" });
    }
    let image;
    if (req.file) {
      image = req.file.path
    }

    const subcategoryCreated = await SubCategory.create({ subCategory: req.body.name, image: image, parentCategory: data._id });
    return res.status(201).send({ status: 200, message: "Sub Category add successfully", data: subcategoryCreated, });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error while creating sub category", });
  }
};

exports.updateSubCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id);
  if (!subCategory) new ErrorHander("Sub Category Not Found !", 404);
  if (req.body.categoryId != (null || undefined)) {
    const data = await Category.findById(req.body.categoryId);
    if (!data || data.length === 0) {
      return res.status(400).send({ status: 404, msg: "not found" });
    }
  }
  let image;
  if (req.file) {
    image = req.file.path
  }
  subCategory.name = req.body.name || subCategory.name;
  subCategory.image = image || subCategory.image;
  subCategory.parentCategory = req.body.categoryId || subCategory.parentCategory;
  await subCategory.save();
  return res.status(200).json({ message: "Updated Successfully" });
});
exports.getSubCategory = async (req, res) => {
  const categories = await SubCategory.find({ parentCategory: req.params.Category }).populate('parentCategory', 'name');
  return res.status(201).json({ message: "Service Category Found", status: 200, data: categories, });
};


exports.TotalCategory = async (req, res) => {
  try {
    const data = await Category.find();
    return res.status(200).json({
      total: data.length
    })
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    })
  }
}


exports.DeleteCategory = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Category.findByIdAndDelete({ _id: req.params.id })
    await SubCategory.deleteMany({ parentCategory: req.params.id });
    return res.status(200).json({
      message: "Deleted"
    })
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    })
  }
})