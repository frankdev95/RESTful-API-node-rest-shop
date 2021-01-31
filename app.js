require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// External Route Handlers
const productRoutes = require('./api/routes/products'),
      orderRoutes = require('./api/routes/orders'),
      userRoutes = require('./api/routes/user');

const url = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASSWORD}@cluster0.wfozn.mongodb.net/node-rest-shop?retryWrites=true&w=majority`;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if(err) return console.log(err);
    console.log("Successfully connected to mongoDB Atlas");
});

/*
  app.use is a type of middleware, middleware acts as a bridge between requests and responses, middleware is called
  after the request is retrieved by the server, but before a response is sent back. This allows you to carry out
  specific functionality in that specific stage of execution, such as authenticating a request or attaching additional
  information to the response.
*/
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Protecting API from CORS (Cross-Origin-Resource-Sharing).
/*
  if you fetch resources from a server that is different from the server the webpage you are on is being served from,
  for security purposes you will not be allowed to access that server and you will return a CORS error. To allow access
  to your API from any server, you must pass specific headers with information specifying what servers are allowed
  access, commonly this is specified as any server.
 */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
               'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    /*
      by default the browser will always send an options request first when sending any request to your server, the
      response to this request tells the browser if are allowed to make the current request.
    */
    if(req.method === 'OPTIONS') {
        // tells the browser what methods can be sent to your server.
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes that handle specific url configurations which represent different requests.
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

/*
  middleware function which is called if no routes are created to handle a specific url request as it is placed after
  the routes configuration in the code. The function configures the error message that will be sent back to the browser
  to show information pertaining to that particular error, such as 404 (route not found).
 */
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
       error: {
           message: error.message
       }
    });
});

module.exports = app;
