const db = require('../models');
const Contents = db.contents;
const Users = db.users;
const { randomString } = require('../extensions');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

const CrudController = {
  create: async (req, res) => {
    try {
      const foundUser = await Users.findByPk(req.userId);
      const foundLinkVideo = await Contents.findOne({ where: { linkVideo: req.body.linkVideo } });
      if (!foundUser) return res.status(404).send({ message: 'User Not found.' });
      if (foundLinkVideo) return res.status(404).send({ message: 'Video link already exists!' });
      await Contents.create({
        userId: foundUser.id,
        title: req.body.title,
        description: req.body.description,
        linkVideo: req.body.linkVideo,
        videoName: req.body.linkVideo,
        published: req.body.stateContent,
      });
      return res.status(200).send({ message: 'Created successfully!' });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  myContents: async (req, res) => {
    try {
      const data = await Contents.findAll({ where: { userId: req.userId } });
      if (Object.keys(data).length === 0) return res.status(404).send({ message: 'User content not found.' });
      else return res.status(200).send(data);
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  upload: async (req, res) => {
    try {
      const foundUser = await Users.findByPk(req.userId);
      const getAllContent = await Contents.findAll();
      if (!foundUser) return res.status(404).send({ message: 'User Not found.' });
      let linkVideo = randomString(11);
      while (getAllContent.some((result) => result.linkVideo === linkVideo)) linkVideo = randomString(11);
      await Contents.create({
        userId: req.userId,
        title: req.body.title,
        description: req.body.description,
        videoName: req.file.filename,
        linkVideo,
        published: req.body.stateContent,
      });
      return res.status(200).send({ message: 'Upload successfully!' });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const foundVideo = await Contents.findByPk(req.body.linkVideo);
      const newFileName = req.body.fileName;
      const oldPath = 'public/videos/' + foundVideo.fileName;
      const newPath = 'public/videos/' + newFileName;
      fs.rename(oldPath, newPath, (err) => {
        if (err) return res.status(500).send({ message: err });
      });
      const data = {
        title: req.body.title,
        description: req.body.description,
        linkVideo: req.body.linkVideo,
        published: req.body.stateContent,
      };
      await foundVideo.update(data);
      return res.status(200).send({ message: 'Updated successfully.' });
    } catch (error) {
      return res.status(500).send({ message: 'Error update !' });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await Contents.destroy({ where: { id: req.params.id } });
      if (result === 0) return res.status(404).send({ message: 'Content not found!' });
      await unlinkAsync(`public\\images\\avatar\\${foundLinkVideo.linkVideo}`);
      return res.send({ message: 'Deleted successfully.' });
    } catch (error) {
      return res.status(500).send({ message: 'Error delete !' });
    }
  },

  multipleDelete: async (req, res) => {
    try {
      const result = await Contents.destroy({ where: { id: req.body.ids } });
      if (!result) return res.status(404).send({ message: 'Content not found!' });
      return res.send({ message: 'Deleted successfully.' });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};

module.exports = CrudController;
