var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const passport = require('passport');


/** All post request *//////////////////////////////////////////////

// register user route
router.post('/register-farmer',  adminController.registerFarmer)

// // add image to an event
// router.put('/trigger-notification',  adminController.uploadMedias)

// create product
router.put('/add-product',  adminController.createProduct)

// set profie pic
router.put('/set-profile-pic',  adminController.setProfilePic)

//upload product image
router.put('/upload-product-image', adminController.setProductImage)

// edit farmer
router.put('/edit-farmer', adminController.editFarmer)

// edit product
router.put('/edit-product', adminController.editProduct)


// login user
router.post('/login', adminController.loginFarmer)


// /** All get request *///////////////////////////////////////////////////////////////

// get all farmers
router.get('/get-all-farmers', adminController.findAllFarmers)


// get single farmer
router.get('/get-single-farmer', adminController.singleFarmer)

// get all product
router.get('/get-all-product', adminController.getAllProduct)

// // get single emergency
// router.get('/get-single-emergency', adminController.getSingleEmergency)

// remove single product
router.put('/remove-single-product', adminController.deleteProduct)

// remove all farmers product
router.put('/remove-all-farmers-product', adminController.deleteAllFarmersProduct)

// delete farmers account 
router.delete('/delete-farmers-account', adminController.deleteFarmersAccount)


module.exports = router;