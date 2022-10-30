const Joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

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
        
    password: joiPassword.string()
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .required(),

   
    address: Joi.string()
        .required(),
})

module.exports = farmerJoischema