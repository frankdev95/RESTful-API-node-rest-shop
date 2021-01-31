const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

module.exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('product quantity')
        .populate('product', '_id name')
        .then(orders => {
            res.status(200).json({
                count: orders.length,
                orders: orders.map(order => {
                    return {
                        order: {
                            _id: order._id,
                            product: order.product,
                            quantity: order.quantity,
                        },
                        request: {
                            method: 'GET',
                            description: 'Get the individual order',
                            url: `http://localhost:3000/orders/${order._id}`
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

module.exports.orders_get_single = (req, res, next) => {
    Order.findById(req.params.id)
        .populate('product')
        .then(order => {
            console.log(order);

            if(!order) {
                return res.status(404).json({
                    message: 'Please enter a valid order ID'
                })
            }

            res.status(200).json({
                message: 'Order obtained',
                order: {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity
                },
                request: {
                    method: 'GET',
                    description: 'Get all orders',
                    url: 'http://localhost:300/orders'
                }

            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            })
        })
}

module.exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productID)
        .then(product => {

            if(!product) {
                return res.status(404).json({
                    message: 'Please enter a valid product ID'
                });
            }

            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: product._id,
                quantity: req.body.quantity,
            });

            return order.save();
        })
        .then(order => {
            console.log(order);
            res.status(201).json({
                message: 'New order created',
                createdProduct: {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity
                },
                request: {
                    method: 'GET',
                    description: 'Get the individual product',
                    url: `http://localhost:3000/orders/${order._id}`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'Please specify a valid ID',
                error: err
            });
        });
}

module.exports.orders_delete_order = (req, res, next) => {
    Order.deleteOne({_id: req.params.id})
        .then(result => {

            if(!result.deletedCount > 0) {
                res.status(404).json({
                    message: "Please enter a valid order ID"
                });
            }

            res.status(200).json({
                message: 'Order deleted',
                request: {
                    method: 'POST',
                    description: 'Create a new order',
                    url: 'http://localhost:3000/orders',
                    data: {
                        productID: 'ID',
                        quantity: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Unable to delete order with id specified',
                error: err
            });
        });
}
