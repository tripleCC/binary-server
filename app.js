const Koa = require('koa')
const router = require('./server/routes')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const koaBody = require('koa-body')

const app = new Koa

mongoose.connect('mongodb://localhost/binary_database')

app.use(koaBody({ multipart: true }))
app.use(logger())
app.use(router.routes())
app.listen(8080)