const Joi = require('joi');
const farmerJoischema = Joi.object({
    username: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    firstName: Joi.string()
        .required(),

    lastName: Joi.string()
        .required(),

    phone: Joi.string()
        .required(),
        
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

   
    address: Joi.string()
        .required(),
})

module.exports = farmerJoischema