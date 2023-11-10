const db = require('../models');
const Contents = db.contents;
const Users = db.users;

const rolesController = {
  userBoard: async (req, res) => {
    try {
      const contents = await Contents.findAll({
        limit: 20,
        order: [['createdAt', 'DESC']],
        where: { userId: req.userId },
        attributes: ['id', 'title', 'description', 'linkVideo', 'view', 'createdAt', 'like', 'disLike'],
      });
      const user = await Users.findByPk(req.userId);
      const { channelName, subscriber, avatar, username, email } = user;
      const data = { contents, user: { channelName, subscriber, avatar, username, email } };
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  adminBoard: async (req, res) => {
    try {
      const infor = await User.findOne({ where: { id: req.userId } });
      const { username } = infor;
      return res.status(200).send({ username });
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  moderatorBoard: async (req, res) => {
    try {
      const data = await User.findOne({ where: { id: req.userId } });
      return res.status(200).send({ data });
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};

module.exports = rolesController;
