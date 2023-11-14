const db = require('../models');
const Contents = db.contents;
const Users = db.users;
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

const profileController = {
  visitChannel: async (req, res) => {
    try {
      const contents = await Contents.findOne({
        limit: 20,
        order: [['createdAt', 'DESC']],
        where: { userId: req.userId, public: true },
        attributes: ['id', 'title', 'description', 'linkVideo', 'view', 'createdAt', 'like', 'disLike'],
      });
      const user = await Users.findOne({ where: { channelName: req.params.channelname } });
      const { channelName, subscriber, avatar, username, email } = user;
      const data = { contents, user: { channelName, subscriber, avatar, username, email } };
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  myChannel: async (req, res) => {
    try {
      const contents = await Contents.findAll({
        limit: 20,
        order: [['createdAt', 'DESC']],
        where: { userId: req.userId },
        attributes: ['id', 'title', 'description', 'linkVideo', 'videoName', 'view', 'createdAt', 'like', 'disLike'],
      });
      const user = await Users.findByPk(req.userId);
      const { channelName, subscriber, avatar, username, email } = user;
      const data = { contents, user: { channelName, subscriber, avatar, username, email } };
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  editAvatar: async (req, res) => {
    try {
      const foundUser = await Users.findByPk(req.userId);
      if (!foundUser) return res.status(404).send({ message: 'User Not found.' });
      await unlinkAsync(`public\\images\\avatar\\${foundUser.avatar}`);
      await foundUser.update({
        avatar: req.file.filename,
      });
      return res.status(200).send({ message: 'You have successfully updated your avatar!' });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};

module.exports = profileController;
