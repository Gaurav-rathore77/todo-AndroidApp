const Product = require("../models/product");

const createProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const product = new Product({ name, price, description, owner: req.user._id });
        await product.save();
        res.json({ message: "Product created" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ owner: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchProducts = async (req, res) => {
    try {
        const { query } = req.params;
        const products = await Product.find({ name: { $regex: query, $options: "i" } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    createProduct,
    getProducts,
    searchProducts,
    getAllProducts,
    getProduct,
    updateProduct
};