const Farmer = require('../models/farmer')
const Joi = require('joi');
const farmerJoischema = require('../joi_models/farmers_joi')
const passport = require('passport');
const multer = require('multer');
const {singleUpload,singleAllMediaUpload,singleAudioUpload} = require('../middlewares/filesMiddleware');
const { v4: uuidv4 }  = require('uuid');
const jwt =require('jsonwebtoken');
const math = require('../middlewares/math.middleware')
const randomstring = require("randomstring");
const cloudinary = require('cloudinary');

const cloudinaryUplouder = require('./uploadCloudinary');
const { findOne } = require('../models/farmer');

// cloudinary configuration for saving files
// cloudinary.config({
//     cloud_name: 'mustyz',
//     api_key: '727865786596545',
//     api_secret: 'HpUmMxoW8BkmIRDWq_g2-5J2mD8'
// })


// staff registration controller
exports.registerFarmer = async (req, res, next) => {
    try {
      const { error, value } = farmerJoischema.validate(req.body,{abortEarly: false});

      if(error){

        res.json({ success: false, error })

      }else{

          // create the user instance
          user = new Farmer(value)
          const password = value.password 
          //save the user to the DB
          await Farmer.register(user, password, function (error, user) {
            if (error) return res.json({ success: false, error }) 
            const newUser = {
              _id: user._id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              address: user.address,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              __v: user.__v
            }
            
            res.json({ success: true, newUser })
          })
    
        }
        
      } catch (error) {
        res.json({ success: false, error })
      }
  }

  // reset password
//   exports.changePassword = async (req, res, next) => {
//     const {username} = req.query
//     Farmer.findOne({ username },(err, user) => {
//       // Check if error connecting
//       if (err) {
//         res.json({ success: false, message: err }); // Return error
//       } else {
//         // Check if user was found in database
//         if (!user) {
//           res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
//         } else {
//           user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
//              if(err) {
//                       if(err.name === 'IncorrectPasswordError'){
//                            res.json({ success: false, message: 'Incorrect password' }); // Return error
//                       }else {
//                           res.json({ success: false, message: 'Something went wrong!! Please try again after sometimes.' });
//                       }
//             } else {
//               res.json({ success: true, message: 'Your password has been changed successfully' });
//              }
//            })
//         }
//       }
//     });
//   }

// exports.forgetPassword = async (req,res,next) => {

//   const newPassword = math.randomNumber()
//   try {

//       const user = await Farmer.findOne({
//         username: req.query.username
//     });
//     await user.setPassword(newPassword.toString());
//     const updatedUser = await user.save();
//     const data = {
//       from: "MAU@gmail.com",
//       to: "onemustyfc@gmail.com",
//       subject: "CHANGED PASSWORD",
//       text: `Your new password is ${newPassword}`
//     };
//     mg.messages().send(data, function (error, body) {
//       console.log(body);
//     });
//     res.json({success:true, message:"Password have been reset and sent to email"})
//   } catch (error) {
//     res.json({success:false, message:error})
//   }
    
// }

  // staff login controller
exports.loginFarmer = (req, res, next) => {

  let payLoad = {}
  // perform authentication
  passport.authenticate('farmer', (error, user, info) => {
    if (error) return res.json({ success: false, error })
    if (!user)
      return res.json({
        success: false,
        message: 'username or password is incorrect'
      })
    //login the user  
    req.login(user, (error) => {
      if (error){
        res.json({ success: false, message: 'something went wrong pls try again' })
      }else {
        req.session.user = user
        payLoad.id = user.username
        const token = jwt.sign(payLoad, 'myVerySecret');

        const newUser = {
          token: token,
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          __v: user.__v
        }
        
        res.json({ success: true, message: 'user login successful', newUser})
      }
    })
  })(req, res, next)
}

 


// find all company
exports.findAllFarmers = async (req,res, next) => {

  try {
    const result = await Farmer.find({});
    result.length > 0
    ? res.json({success: true, message: result,})
    : res.json({success: false, message: result,})
  } catch (error) {
    console.log(error)
  }
  
}


// find single Farmer
exports.singleFarmer = async (req,res, next) => {
  const {username} = req.query
  try {
    const result = await Farmer.findOne({username: username});
    result
     ? res.json({success: true, message: result,})
     : res.json({success: false, message: result,})
    
  } catch (error) {
    console.log(error)
  }
}

// set profile pic
  exports.setProfilePic = async (req,res, next) => {
  
    singleUpload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
      return res.json(err.message);
      }
      else if (err) {
        return res.json(err);
      }
      else if (!req.file) {
        return res.json({"image": req.file, "msg":'Please select an image to upload'});
      }
      if(req.file){

        
          const result = await Farmer.findOne({username: req.query.username},{_id: 0,image: 1})
          
          let isImageDeleted 
          if (result.image != null || result.image != undefined) isImageDeleted = await cloudinaryUplouder.delete(result.image)
          else isImageDeleted = true 

          // sending image to claudinary and saving the link to database
          let mediaImage 
          if(isImageDeleted) mediaImage = await cloudinaryUplouder.upload(req.file.path)
          
          await Farmer.findOneAndUpdate({username: req.query.username},{$set: {image: mediaImage}})
          const editedStaff = await Farmer.findOne({username: req.query.username},{emergencies:0})
          
          res.json({success: true,message: editedStaff,});
      }
    });
      
       
  }
       


// edit Farmer
exports.editFarmer = async (req,res,next) => {
  try {
    const {username} = req.query;
    await Farmer.findOneAndUpdate({username: username}, req.body)
    const result = await Farmer.findOne({username: username})
    res.json({success: true, message: result})
    
  } catch (error) {
    console.log(error)
  }
}


// /**** product START HERE     ****//////////////////////////////////////////////

// create product
exports.createProduct = async (req,res, next) => {
  const {username} = req.body
  const data = {productName, category, quantity, price} = req.body
  data.productId = uuidv4()
  data.image = null
  data.timeEntered = new Date()

  try {
    await Farmer.findOneAndUpdate({"username":username},{$push:{"product":data}},{new:true})
    const result = await Farmer.findOne({"username":username})
    res.json({success:true, message:"product added",result})
  } catch (error) {
    console.log(error)
  }
}

// get all product
exports.getAllProduct = async (req,res, next) => {
  try {
    const result = await Farmer.aggregate([
      {$match: {}},
      {$project: {hash:0,salt:0}},
      {$unwind: "$product"}
    ]);
    res.json({success: true, message: result,})
    
  } catch (error) {
    console.log(error)
    
  }
}

// // get single emergency
// exports.getSingleEmergency = async (req,res, next) => {
//   const {productId} = req.query
//   try {
//     const result = await Farmer.findOne({"emergencies.productId":productId},{emergencies:1});
//     console.log(result)
//     const singleProduct = result.emergencies.filter(emgy => emgy.productId == productId)
//     res.json({success: true, message: singleProduct,})
    
//   } catch (error) {
//     console.log(error)
    
//   }
// }

// delete product

exports.deleteProduct = async (req,res, next) => {
  const {productId,username} = req.query
  try {
    const singleProduct = await Farmer.aggregate([
        {$match: {"product.productId": productId}},
        {$project: {product:1, _id:0}},
        {$unwind: "$product"},
        {$match: {"product.productId": productId}}
        
      ])
    console.log(singleProduct[0].product)

    const cDelete = async ()=>{
      if(singleProduct[0].product.image != null && singleProduct[0].product.image != undefined)  await cloudinaryUplouder.delete(singleProduct[0].product.image)
    }
    const myPromise = new Promise(async (resolve, reject) => {
      resolve(cDelete())
    });

    myPromise.then( async ()=>{
      await Farmer.findOneAndUpdate({"product.productId":productId},{$pull:{"product":{"productId":productId}}},{new:true})
      const result = await Farmer.findOne({username:username})
      res.json({success: true, message: result})
    })
    
  } catch (error) {
    console.log(error)
    
  }
}

// delete all farmers product

exports.deleteAllFarmersProduct = async (req,res, next) => {
  const {username} = req.query
  try {
    const farm = await Farmer.findOne({username:username})
    
    const cDelete = async ()=>{
      farm.product.map(async (prd) => {
        if(prd.image != null && prd.image != undefined)  await cloudinaryUplouder.delete(prd.image)

      })
    }
    const myPromise = new Promise(async (resolve, reject) => {
      resolve(cDelete())
    });

    myPromise.then( async ()=>{
      await Farmer.findOneAndUpdate({"username":username},{$set:{"product":[]}},{new:true})
      const result = await Farmer.findOne({username:username})
      res.json({success: true, message: result})
    })
    
  } catch (error) {
    console.log(error)
    
  }
}



// delete farmers account

exports.deleteFarmersAccount = async (req,res, next) => {
  const {username} = req.query
  try {
    const farm = await Farmer.findOne({username:username})
    
    const cDelete = async ()=>{

      // delete farmers image
      await cloudinaryUplouder.delete(farm.image)

      // delete all product image
      farm.product.map(async (prd) => {
        if(prd.image != null && prd.image != undefined)  await cloudinaryUplouder.delete(prd.image)

      })
    }
    const myPromise = new Promise(async (resolve, reject) => {
      resolve(cDelete())
    });

    myPromise.then( async ()=>{
      await Farmer.deleteOne({"username":username})
      res.json({success: true, message: "account deleted successfully"})
    })
    
  } catch (error) {
    console.log(error)
    
  }
}



// upload product image
exports.setProductImage = async (req,res, next) => {
  const {productId} = req.query
  singleUpload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
    return res.json(err.message);
    }
    else if (err) {
      return res.json(err);
    }
    else if (!req.file) {
      return res.json({"image": req.file, "msg":'Please select an image to upload'});
    }
    if(req.file){

      
      const result = await Farmer.aggregate([
        {$match: {"product.productId": productId}},
        {$project: {product:1}},
        {$unwind: "$product"},
        {$match: {"product.productId": productId}}
        
      ])
      
      let isImageDeleted 
      if(result[0].product.image != null && result[0].product.image != undefined) isImageDeleted = await cloudinaryUplouder.delete(result.image)
      else isImageDeleted = true 
        

        // sending image to claudinary and saving the link to database
        let mediaImage 
        if(isImageDeleted) mediaImage = await cloudinaryUplouder.upload(req.file.path)
        
        await Farmer.findOneAndUpdate({"product.productId": productId},{$set:{
          "product.$[e1].image":mediaImage,
        }},
        { 
          arrayFilters: [
            {"e1.productId": productId},
            ],
        })
        const editedStaff = await Farmer.findOne({"product.productId": productId})
        
        res.json({success: true,message: editedStaff,});
    }
  });
    
     
}

// edit product 
exports.editProduct = async (req,res, next) => {
  const {productId} = req.query
  const data = req.body
                    
    await Farmer.findOneAndUpdate({"product.productId": productId},{$set:{
      "product.$[e1].productName": data.productName,
      "product.$[e1].category": data.category,
      "product.$[e1].price": data.price,
      "product.$[e1].quantity": data.quantity,
    }},
    { 
      arrayFilters: [
        {"e1.productId": productId},
        ],
    })
    const editedStaff = await Farmer.findOne({"product.productId": productId})
    
    res.json({success: true,message: editedStaff,});
    
     
}
