const db = require('../models')
const Contents = db.contents
const Op = db.Sequelize.Op

const searchTitle = {
  public: async (req, res) => {
    try {
      const title = req.query.q
      var condition = title
        ? { title: { [Op.like]: `%${title}%` }, published: true }
        : null
      const data = await Contents.findAll({ where: condition })
      return res.status(200).send(data)
    } catch (error) {
      res.status(500).send({ message: error.message })
    }
  },

  private: async (req, res) => {
    try {
      const title = req.query.q
      var condition = title
        ? { title: { [Op.like]: `%${title}%` }, userId: req.body.userId }
        : null
      const data = await Contents.findAll({ where: condition })
      return res.status(200).send(data)
    } catch (error) {
      res.status(500).send({ message: error.message })
    }
  }
}

module.exports = searchTitle
