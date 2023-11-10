const db = require("../models");
const Users = db.users;

const verifySignUp = {
  checkDuplicateUsernameOrEmail: async (req, res, next) => {
    try {
      const user = await Users.findOne({where: {username: req.body.username}})
      if (user) {
        return res.status(400).send({
          message: "Failed! Username is already in use!"
        });
      }
      const email = await Users.findOne({where: {email: req.body.email}})
      if (email) {
        return res.status(400).send({
          message: "Failed! Email is already in use!"
        });
      }
      next();
    } catch (error) {
      return res.status(400).send(error);
    }
  }
};

module.exports = verifySignUp;