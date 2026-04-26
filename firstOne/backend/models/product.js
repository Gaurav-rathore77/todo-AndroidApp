const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    name: String,
    price: Number,
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    description: String
});

module.exports = model("Product", productSchema);