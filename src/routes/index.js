const authRouter = require('./auth.routes')
const rolesRouter = require('./roles.routes')
const crudRouter = require('./crud.routes')
const show = require('./show.routes')
const myChannel = require('./myChannel.routes')
const content = require('./content.routes')
const searchRouter = require('./search.routes')

function route(app) {
    app.use('/auth', authRouter)
    app.use('/roles', rolesRouter)
    app.use('/crud', crudRouter)
    app.use('/show', show)
    app.use('/myChannel', myChannel)
    app.use('/content', content)
    app.use('/search', searchRouter)
}

module.exports = route