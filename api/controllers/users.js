const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

module.exports.users_find_all = (req, res, next) => {
    User.find()
        .then(users => {
            res.status(200).json({
                count: users.count,
                users: users.map(user => {
                    return {
                        _id: user._id,
                        email: user.email,
                        password: user.password,
                        request: {
                            method: 'GET',
                            description: "Get the individual user",
                            url: `http://localhost:3000/user/${user._id}`
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}

module.exports.user_get_single = (req, res) => {
    User.findById(req.params.id)
        .then(user => {
            if(!user) {
                res.status(404).json({
                    message: 'Please enter a valid user ID'
                });
            }

            res.status(200).json({
                message: "User obtained",
                user: user,
                request: {
                    method: 'GET',
                    description: 'Get all users',
                    url: 'http://localhost:3000/user'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

module.exports.user_sign_up = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {

            if(user) {
                return res.status(409).json({
                    message: "User with given email already exists"
                });
            } else {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if(err) {
                        return res.status(500).json({
                            error: err
                        });
                    }

                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });

                    user.save()
                        .then(user => {
                            res.status(201).json({
                                message: "New user created",
                                user: {
                                    _id: user._id,
                                    email: user.email,
                                    password: user.password
                                },
                                request: {
                                    method: "GET",
                                    description: "Get the individual user",
                                    url: `http://localhost:3000/user/${user._id}`
                                }
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                });
            }
        });
}

module.exports.user_log_in = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                return res.status(401).json({
                    message: "Authorization failed"
                });
            }

            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(err || !result) {
                    return res.status(401).json({
                        message: "Authorization failed"
                    });
                }

                if(result) {
                    /* JWT (JSON Web Token) - allows a token to be sent back to the client with relevant information
                       after authorization is successful, this means the user can access the API until the token
                       expires, preventing them from having to receive authorization every time they need data from
                       the API. A secret key is specified during token creation, so that when the user accesses the API
                       for all subsequent data retrievals, the token is passed back and the key is compared, if it
                       matches the key supplied during token creation, the user is authorized. */

                    // If you set the jwt.sign to a variable the function runs synchronously and is stored in the
                    // variable, you can always specify a callback for asynchronous functionality.
                    const token = jwt.sign({ // payload specifies what information is sent back to the user via the token, which is used to create the key
                        email: user.email,
                        userID: user._id
                    }, process.env.JWT_KEY, { // allows options for the token such as token expiry date
                        expiresIn: '1h', // 1h is a good duration for security reasons.
                    });
                    res.status(200).json({
                        message: "Authorization successful",
                        token: token // pass the token back to the authorized user via the response
                    });
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

module.exports.user_delete_single = (req, res) => {
    User.deleteOne({_id: req.params.id})
        .then(result => {
            if(result.deletedCount > 0) {
                return res.status(200).json({
                    message: "User deleted"
                });
            }

            res.status(404).json({
                message: "Please enter a valid user ID"
            });

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}
