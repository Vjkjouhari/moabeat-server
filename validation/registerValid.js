const Joi = require("joi");

const registerValid = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  mobile_no: Joi.string(),
  password: Joi.string().min(8).max(30).required(),
  cnf_password: Joi.string().min(8).max(30).required(),
});

module.exports = { registerValid };
// 