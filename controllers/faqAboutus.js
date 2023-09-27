const aboutus = require('../models/aboutus');
const Faq = require("../models/faqModel");
exports.createAboutUs = async (req, res) => {
    try {
        const newAboutUs = {
            title: req.body.title,
            desc: req.body.desc,
        }
        const result = await aboutus.create(newAboutUs)
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: result });
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getAboutUs = async (req, res) => {
    try {
        const result = await aboutus.find({ type: "ABOUTUS" });
        if (!result || result.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: result });

    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getAboutUsById = async (req, res) => {
    try {
        const data = await aboutus.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.updateAboutUs = async (req, res) => {
    try {
        const data = await aboutus.findById(req.params.id);
        if (!data || data.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        } else {
            let title = req.body.title || data.title;
            let desc = req.body.desc || data.desc;
            const result = await aboutus.findByIdAndUpdate({ _id: req.params.id }, { $set: { title: title, desc: desc } }, { new: true });
            return res.status(200).json({ status: 200, message: "update successfully.", data: result });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.deleteAboutUs = async (req, res) => {
    try {
        const result = await aboutus.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ message: "ok" })
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find({}).lean();
        if (faqs.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "faqs retrieved successfully ", data: faqs });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getFaqById = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await Faq.findById(id);
        if (!faq) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "faqs retrieved successfully ", data: faq });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.createFaq = async (req, res) => {
    const { question, answer, categoryId } = req.body;
    try {
        if (!question || !answer) {
            return res.status(400).json({ message: "questions and answers cannot be blank " });
        }
        let obj = {
            question: question,
            answer: answer,
        }
        const faq = await Faq.create(obj);
        return res.status(200).json({ status: 200, message: "FAQ Added Successfully ", data: faq });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error ", status: 500, data: err.message });
    }
};
exports.updateFaq = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await Faq.findByIdAndUpdate(id, req.body, { new: true });
        if (!faq) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "update successfully.", data: faq });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
};
exports.deleteFaq = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await Faq.findByIdAndDelete(id);
        if (!faq) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "FAQ Deleted Successfully ", data: faq });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
};