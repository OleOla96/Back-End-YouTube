const db = require('../models');
const Users = db.users;
const Roles = db.roles;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
let refreshTokens = [];
const authController = {
  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPwd = await bcrypt.hash(password, 8);
      const newUser = await Users.create({
        username,
        email,
        password: hashedPwd,
        channelName: username,
      });
      const role = await Roles.findOne({
        where: {
          name: 'user',
        },
      });
      newUser.setRoles([role.id]);
      return res.status(200).send({ message: 'User was registered successfully!' });
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  generateAccessToken: (user, roles) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '5s' },
    );
  },

  generateRefreshToken: (user, roles) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: '1d' },
    );
  },

  signin: async (req, res) => {
    try {
      const user = await Users.findOne({ where: { username: req.body.username } });
      if (!user) {
        return res.status(404).send({ message: 'User does not exist.' });
      }
      const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'Invalid Password!',
        });
      }

      let roles = [];
      const _roles = await user.getRoles();
      for (let i = 0; i < _roles.length; i++) {
        roles.push(_roles[i].name);
      }
      const accessToken = authController.generateAccessToken(user, roles);
      const refreshToken = authController.generateRefreshToken(user, roles);
      refreshTokens.push(refreshToken);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
      });
      res.status(200).send({
        username: user.username,
        avatar: user.avatar,
        accessToken,
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  requestRefreshToken: async (req, res) => {
    //Take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json('Refresh token is not valid');
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(403).send(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      //Create new accesstoken, refresh token
      const newAccessToken = authController.generateAccessToken(user, user.roles);
      const newRefreshToken = authController.generateRefreshToken(user, user.roles);
      refreshTokens.push(newRefreshToken);
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
      });
      res.status(200).send({ accessToken: newAccessToken });
    });
  },

  signout: (req, res) => {
    res.clearCookie('refreshToken');
    refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshToken);
    console.log('======> Logged out !');
    res.status(200).send({ message: 'Logged out !' });
  },
};

module.exports = authController;
