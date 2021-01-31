const Product = require('../models/product');
const mongoose = require('mongoose');

module.exports.products_get_all = (req, res, next) => {
    Product.find()
        .then(products => {
            const response = {
                count: products.length,
                products: products.map((product) => {
                    return {
                        product: {
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            productImage: product.productImage,
                        },
                        request: {
                            method: 'GET',
                            description: 'Get the individual product',
                            url: `http://localhost:3000/products/${product._id}`
                        }
                    }

                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

module.exports.products_get_single = (req, res, next) => {
    Product.findById(req.params.id)
        .select('_id name price productImage')
        .then(product => {

            if(!product) {
                return res.status(404).json({
                    message: 'Please enter a valid product ID'
                });
            }

            res.status(201).json({
                message: 'Product obtained',
                product: product,
                request: {
                    method: 'GET',
                    description: 'Get all products',
                    url: 'http://localhost:3000/products'
                }
            });


        })
        .catch(err => {
            console.error(err)
            res.status(500).json({
                message: 'Unable to retrieve product with specified id',
                error: err
            });
        });
}

module.exports.products_create_product = (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product.save()
        .then(product => {
            res.status(201).json({
                message: 'New product created',
                createdProduct: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    productImage: product.productImage,
                },
                request: {
                    method: 'GET',
                    description: 'Get the individual product',
                    url: `http://localhost:3000/products/${product._id}`
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Unable to save product with details specified',
                error: err
            });
        });
}

module.exports.products_update_single =  (req, res) => {
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propertyName] = ops.value;
    }
    Product.updateOne({_id: req.params.id}, {$set : updateOps})
        .then(product => {

            if(product.nModified === 0) {
                return res.status(404).json({
                    message: 'Please enter a valid product ID'
                });
            }

            res.status(200).json({
                message: 'Product updated',
                request: {
                    method: 'GET',
                    description: 'Get the newly updated product',
                    url: `http://localhost:3000/products/${req.params.id}`
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            })
        });
}

module.exports.product_delete_single = (req, res) => {
    Product.deleteOne({_id: req.params.id})
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    method: "POST",
                    description: 'Create a new product',
                    url: 'http://localhost:3000/products',
                    data: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: "Unable to delete product with id specified",
                error: err
            })
        });
}
