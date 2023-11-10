const sequelize = require('sequelize');
const db = require('../models');
const Contents = db.contents;
const Users = db.users;
const Followers = db.followers;
const Likers = db.likers;

const contentsController = {
  showAll: async (req, res) => {
    try {
      const data = await Contents.findAll({
        limit: 30,
        order: [['createdAt', 'DESC']],
        where: { published: true },
        attributes: ['id', 'title', 'description', 'linkVideo', 'view', 'createdAt'],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'avatar'],
          },
        ],
      });
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  watch: async (req, res) => {
    try {
      console.log('===========>', req.params.linkVideo);
      const video = await Contents.findOne({ where: { linkVideo: req.params.linkVideo } });
      await video.increment('view');
      const contents = await Contents.findAll({
        limit: 20,
        order: [['createdAt', 'DESC']],
        where: { published: true },
        attributes: ['id', 'title', 'description', 'linkVideo', 'view', 'createdAt', 'userId', 'like', 'disLike'],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'subscriber', 'username', 'avatar'],
          },
        ],
      });
      let data = [];
      let followers;
      let likers;
      if (req.userId) {
        followers = await Followers.findAll();
        likers = await Likers.findAll();
      }
      for (const i of contents) {
        let follow = false;
        let statusLike = null;
        if (req.userId && Object.keys(followers).length > 0) {
          for (const j of followers) {
            if (j.userId === i.userId && j.followerId === req.userId && j.status) {
              follow = true;
              break;
            }
          }
        }
        if (req.userId && Object.keys(likers).length > 0) {
          for (const m of likers) {
            if (m.contentId === i.id && m.likerId === req.userId && m.status === true) {
              statusLike = true;
              break;
            }
            if (m.contentId === i.id && m.likerId === req.userId && m.status === false) {
              statusLike = false;
              break;
            }
          }
        }
        data.push({
          title: i.title,
          id: i.id,
          userId: i.userId,
          username: i.user.username,
          channelName: i.user.channelName,
          avatar: i.user.avatar,
          description: i.description,
          linkVideo: i.linkVideo,
          view: i.view,
          like: i.like,
          disLike: i.disLike,
          statusLike,
          createdAt: i.createdAt,
          subscriber: i.user.subscriber,
          follow,
        });
      }
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  subcribe: async (req, res) => {
    try {
      if (req.userId === req.query.channelId) return res.status(403).send({ message: 'Unauthorized' });
      const find = await Followers.findOne({
        where: {
          userId: req.query.channelId,
          followerId: req.userId,
        },
      });
      const value = req.query.v === 'true';
      if (find) {
        if (value) {
          await Followers.update({ status: true }, { where: { followerId: req.userId } });
          const findUser = await Users.findByPk(req.query.channelId);
          await findUser.increment('subscriber');
          return res.status(200).send({ message: 'Subscribed' });
        } else {
          await Followers.update({ status: false }, { where: { followerId: req.userId } });
          const findUser = await Users.findByPk(req.query.channelId);
          if (findUser.subscriber === 0) return res.status(400).send({ message: 'Error' });
          await findUser.decrement('subscriber');
          return res.status(200).send({ message: 'Unsubscribed' });
        }
      } else {
        await Followers.create({
          userId: req.query.channelId,
          followerId: req.userId,
          status: true,
        });
        const findUser = await Users.findByPk(req.query.channelId);
        await findUser.increment('subscriber');
        return res.status(200).send({ message: 'Subscribed' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  like: async (req, res) => {
    try {
      const findContent = await Contents.findByPk(req.query.id);
      const findLike = await Likers.findOne({
        where: {
          likerId: req.userId,
          contentId: req.query.id,
        },
      });
      if (findLike) {
        if (req.query.v === 'true') {
          await Likers.update(
            { status: true },
            {
              where: {
                likerId: req.userId,
                contentId: req.query.id,
              },
            },
          );
          await findContent.increment('like');
          if (findLike.status === false) await findContent.decrement('disLike');
          return res.status(200).send({ message: 'Liked' });
        } else if (req.query.v === 'false') {
          await Likers.update(
            { status: false },
            {
              where: {
                likerId: req.userId,
                contentId: req.query.id,
              },
            },
          );
          await findContent.increment('disLike');
          if (findLike.status === true) await findContent.decrement('like');
          return res.status(200).send({ message: 'Disliked' });
        } else {
          await Likers.update(
            { status: null },
            {
              where: {
                likerId: req.userId,
                contentId: req.query.id,
              },
            },
          );
          if (req.query.t === 'unlike') {
            if (findContent.like === 0) return res.status(400).send({ message: 'Error' });
            await findContent.decrement('like');
          }
          if (req.query.t === 'undislike') {
            if (findContent.dislike === 0) return res.status(400).send({ message: 'Error' });
            await findContent.decrement('disLike');
          }
          return res.status(200).send({ message: '' });
        }
      } else {
        if (req.query.v === 'true') {
          await Likers.create({
            contentId: req.query.id,
            likerId: req.userId,
            status: true,
          });
          await findContent.increment('like');
          return res.status(200).send({ message: 'Liked' });
        } else {
          await Likers.create({
            contentId: req.query.id,
            likerId: req.userId,
            status: false,
          });
          await findContent.increment('disLike');
          return res.status(200).send({ message: 'Disliked' });
        }
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  watchPrivate: async (req, res) => {
    try {
      const video = await Contents.findOne({ where: { linkVideo: req.params.linkVideo } });
      await video.increment('view');
      const contents = await Contents.findAll({
        limit: 20,
        order: [['createdAt', 'DESC']],
        where: { userId: req.userId },
        attributes: ['id', 'title', 'description', 'linkVideo', 'view', 'createdAt', 'like', 'disLike'],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'subscriber', 'avatar'],
          },
        ],
      });
      let data = [];
      for (const i of contents) {
        data.push({
          title: i.title,
          id: i.id,
          userId: i.userId,
          channelName: i.user.channelName,
          avatar: i.user.avatar,
          description: i.description,
          linkVideo: i.linkVideo,
          view: i.view,
          like: i.like,
          disLike: i.disLike,
          createdAt: i.createdAt,
          subscriber: i.user.subscriber,
        });
      }
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  myChannel: async (req, res) => {
    try {
      const inforChannel = await Followers.findOne({
        where: { linkVideo: req.params.linkVideo, published: true },
      });
      const contents = await Contents.findAll({
        where: { userId: req.userId },
        attributes: ['id', 'title', 'description', 'linkVideo', 'view', 'createdAt'],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'subscriber'],
          },
        ],
      });
      const data = { ...inforChannel, ...contents };
      console.log(data);
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};

module.exports = contentsController;
