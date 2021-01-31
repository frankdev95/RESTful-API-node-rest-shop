const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const productsController = require('../controllers/products');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads'); // Params: (potential error, filepath)
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}${file.originalname}`); // Params: (potential error, filename)
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') return cb(null, true);
    // reject a file:
    cb(new Error('File has to be an image file - (jpeg, png)'), false);
    // accept a file:
    // cb(null, true);
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', productsController.products_get_all);
router.get('/:id', productsController.products_get_single);
router.post('/', upload.single('productImage'), checkAuth, productsController.products_create_product);
router.patch('/:id', checkAuth, productsController.products_update_single);
router.delete('/:id', checkAuth, productsController.product_delete_single);

module.exports = router;
