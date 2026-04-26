const express = require("express");
const router = express.Router();
const { createProduct, getProducts, searchProducts, getAllProducts, getProduct, updateProduct } = require("../controllers/product");
const auth = require("../middleware/auth");

router.post("/create", auth, createProduct);
router.get("/all", auth, getAllProducts);
router.get("/:id", auth, getProduct);
router.put("/:id", auth, updateProduct);
router.get("/", auth, getProducts);
router.get("/search", auth, searchProducts);

module.exports = router;