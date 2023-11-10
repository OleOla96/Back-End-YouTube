const express = require('express')
const route = express.Router()
const { verifySignUp } = require("../middleware")
const authController = require("../controllers/auth.controller")

route.post(
  "/signup",
  verifySignUp.checkDuplicateUsernameOrEmail,
  authController.signup
)
route.post("/signin", authController.signin)
route.get("/refresh", authController.requestRefreshToken)
route.get("/signout", authController.signout)
module.exports = route