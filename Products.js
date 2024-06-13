const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load products data
const productsFilePath = path.join(__dirname, '../data/products.json');
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// Function to save products data
const saveProducts = () => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
};

// GET /api/products - List all products with optional limit
router.get('/', (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});

// GET /api/products/:pid - Get a product by ID
router.get('/:pid', (req, res) => {
    const productId = req.params.pid;
    const product = products.find(p => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// POST /api/products - Add a new product
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'All fields except thumbnails are required' });
    }

    const newProduct = {
        id: (products.length > 0) ? (parseInt(products[products.length - 1].id) + 1).toString() : "1",
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    saveProducts();
    res.status(201).json(newProduct);
});

// PUT /api/products/:pid - Update a product by ID
router.put('/:pid', (req, res) => {
    const productId = req.params.pid;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
        ...products[productIndex],
        title: title !== undefined ? title : products[productIndex].title,
        description: description !== undefined ? description : products[productIndex].description,
        code: code !== undefined ? code : products[productIndex].code,
        price: price !== undefined ? price : products[productIndex].price,
        status: status !== undefined ? status : products[productIndex].status,
        stock: stock !== undefined ? stock : products[productIndex].stock,
        category: category !== undefined ? category : products[productIndex].category,
        thumbnails: thumbnails !== undefined ? thumbnails : products[productIndex].thumbnails,
    };

    products[productIndex] = updatedProduct;
    saveProducts();
    res.json(updatedProduct);
});

// DELETE /api/products/:pid - Delete a product by ID
router.delete('/:pid', (req, res) => {
    const productId = req.params.pid;
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    products.splice(productIndex, 1);
    saveProducts();
    res.status(204).end();
});

module.exports = router;
