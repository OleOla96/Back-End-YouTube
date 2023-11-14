const { Op } = require('sequelize');
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
        attributes: ['id', 'title', 'description', 'linkVideo', 'videoName', 'view', 'createdAt'],
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
      const video = await Contents.findOne({
        where: { linkVideo: req.params.linkVideo, published: true },
        attributes: [
          'id',
          'title',
          'description',
          'linkVideo',
          'videoName',
          'view',
          'createdAt',
          'userId',
          'like',
          'disLike',
        ],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'subscriber', 'username', 'avatar'],
          },
        ],
      });
      await video.increment('view');
      const contents = await Contents.findAll({
        where: {
          published: true,
          linkVideo: {
            [Op.ne]: req.params.linkVideo,
          },
        },
        limit: 20,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'linkVideo', 'videoName', 'view', 'createdAt'],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'avatar'],
          },
        ],
      });
      let watch = { ...video.get() };
      if (req.userId) {
        let statusLike;
        let statusFollow;
        const _statusLike = await Likers.findOne({
          where: { likerId: req.userId, contentId: video.id },
          attributes: ['status'],
        });
        // console.log('==============>', video.id);
        const _statusFollow = await Followers.findOne({
          where: { followerId: req.userId, userId: video.userId },
          attributes: ['status'],
        });
        if (_statusLike) {
          // console.log('==============>', video.userId);
          // console.log('==============>', _statusLike.status);
          statusLike = _statusLike.status;
        }
        if (_statusFollow) {
          // console.log('==============>', _statusFollow.status);
          statusFollow = _statusFollow.status;
        }
        watch = {
          ...video.get(),
          statusLike,
          statusFollow,
        };
      }
      const data = { watch, list: [...contents] };
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  watchPrivate: async (req, res) => {
    try {
      const video = await Contents.findOne({
        where: { linkVideo: req.params.linkVideo },
        attributes: [
          'id',
          'title',
          'description',
          'linkVideo',
          'videoName',
          'view',
          'createdAt',
          'userId',
          'like',
          'disLike',
        ],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'subscriber', 'username', 'avatar'],
          },
        ],
      });
      await video.increment('view');
      const contents = await Contents.findAll({
        limit: 20,
        order: [['createdAt', 'DESC']],
        where: {
          userId: req.userId,
          linkVideo: {
            [Op.ne]: req.params.linkVideo,
          },
        },
        attributes: ['id', 'title', 'description', 'linkVideo', 'videoName', 'view', 'createdAt', 'like', 'disLike'],
        include: [
          {
            model: Users,
            attributes: ['channelName', 'subscriber', 'avatar'],
          },
        ],
      });
      const watch = { ...video.get() };
      const data = { watch, list: [...contents] };
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  subcribe: async (req, res) => {
    try {
      if (req.userId === req.query.channelId) return res.status(403).send({ message: 'Unauthorized' });
      const findFollower = await Followers.findOne({
        where: {
          userId: req.query.channelId,
          followerId: req.userId,
        },
      });
      const findUser = await Users.findByPk(req.query.channelId);
      if (findFollower && findUser) {
        if (req.query.v === 'true' && findFollower.status === false) {
          await findFollower.update({ status: true });
          await findUser.increment('subscriber');
          const updateUser = await Users.findByPk(req.query.channelId);
          return res
            .status(200)
            .send({ subscriber: updateUser.subscriber, statusFollow: findFollower.status, message: 'Subscribed' });
        } else if (req.query.v === 'false' && findFollower.status === true) {
          await findFollower.update({ status: false });
          if (findUser.subscriber === 0) return res.status(400).send({ message: 'Error' });
          await findUser.decrement('subscriber');
          const updateUser = await Users.findByPk(req.query.channelId);
          return res
            .status(200)
            .send({ subscriber: updateUser.subscriber, statusFollow: findFollower.status, message: 'Unsubscribed' });
        } else {
          return res.status(400).send({ message: 'Invalid value !' });
        }
      } else {
        await Followers.create({
          userId: req.query.channelId,
          followerId: req.userId,
          status: true,
        });
        await findUser.increment('subscriber');
        const updateUser = await Users.findByPk(req.query.channelId);
        return res.status(200).send({ subscriber: updateUser.subscriber, statusFollow: true, message: 'Subscribed' });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },

  like: async (req, res) => {
    try {
      const findContent = await Contents.findByPk(req.query.id);
      const findLiker = await Likers.findOne({
        where: {
          likerId: req.userId,
          contentId: req.query.id,
        },
      });
      if (findLiker && findContent) {
        if (req.query.v === 'true') {
          if (findLiker.status === false) {
            await findLiker.update({ status: true });
            await findContent.decrement('disLike');
            await findContent.increment('like');
          } else if (findLiker.status === null) {
            await findLiker.update({ status: true });
            await findContent.increment('like');
          } else {
            return res.status(400).send({ message: 'Invalid value 1 !' });
          }
          const updateContent = await Contents.findByPk(req.query.id);
          return res.status(200).send({
            statusLike: true,
            like: updateContent.like,
            disLike: updateContent.disLike,
            message: 'Liked',
          });
        } else if (req.query.v === 'false') {
          if (findLiker.status === true) {
            await findLiker.update({ status: false });
            await findContent.decrement('like');
            await findContent.increment('disLike');
          } else if (findLiker.status === null) {
            await findLiker.update({ status: false });
            await findContent.increment('disLike');
          } else {
            return res.status(400).send({ message: 'Invalid value 2 !' });
          }
          const updateContent = await Contents.findByPk(req.query.id);
          return res.status(200).send({
            statusLike: false,
            like: updateContent.like,
            disLike: updateContent.disLike,
            message: 'Disliked',
          });
        } else {
          if (req.query.t === 'unlike' && findLiker.status === true) {
            if (findContent.like === 0) return res.status(400).send({ message: 'Invalid value 3 !' });
            await findContent.decrement('like');
          } else if (req.query.t === 'undislike' && findLiker.status === false) {
            if (findContent.dislike === 0) return res.status(400).send({ message: 'Invalid value 4 !' });
            await findContent.decrement('disLike');
          } else {
            return res.status(400).send({ message: 'Invalid value 5 !' });
          }
          await findLiker.update({ status: null });
          const updateContent = await Contents.findByPk(req.query.id);
          const updateLiker = await Likers.findOne({
            where: {
              likerId: req.userId,
              contentId: req.query.id,
            },
          });
          return res
            .status(200)
            .send({ statusLike: updateLiker.status, like: updateContent.like, disLike: updateContent.disLike });
        }
      } else if (findContent) {
        if (req.query.v === 'true') {
          await Likers.create({
            contentId: req.query.id,
            likerId: req.userId,
            status: true,
          });
          await findContent.increment('like');
          const updateContent = await Contents.findByPk(req.query.id);
          return res.status(200).send({
            statusLike: true,
            like: updateContent.like,
            disLike: updateContent.disLike,
            message: 'Liked',
          });
        } else if (req.query.v === 'false') {
          await Likers.create({
            contentId: req.query.id,
            likerId: req.userId,
            status: false,
          });
          await findContent.increment('disLike');
          const updateContent = await Contents.findByPk(req.query.id);
          return res.status(200).send({
            statusLike: false,
            like: updateContent.like,
            disLike: updateContent.disLike,
            message: 'Disliked',
          });
        } else {
          return res.status(400).send({ message: 'Invalid value 6 !' });
        }
      } else {
        return res.status(400).send({ message: 'Content does not exist!' });
      }
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
