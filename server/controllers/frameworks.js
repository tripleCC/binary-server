'use strict'

require('../models/component')

const dir = require('../utils/dir')
const path = require('path')
const fs = require('fs')
const os = require('os')
const util = require('util')
const koaBody = require('koa-body')
const mongoose = require('mongoose'),
    Component = mongoose.model('Component')


async function show(ctx) {

    let name = ctx.params.name
    let version = ctx.params.version

    let result = await Component
        .findOne()
        .where('name').equals(ctx.params.name)
        .where('version').equals(ctx.params.version)
        .exec()
    console.log(result)

    let component = new Component()
    component.name = ctx.params.name
    component.version = ctx.params.version
    component.create_at = Date.now
    component.save((err) => {
        console.log(err)
    })

    if (name && version) {
        console.log('get one')

    } else {
        console.log('get all')
    }
    // ctx.body = ctx.params
}

async function create(ctx) {

    if ('POST' != ctx.method) {
        return await next()
    }

    const name = ctx.request.body.fields.name
    const version = ctx.request.body.fields.version

    const binaryDir = dir.binaryDir(name, version)
    if (!fs.existsSync(binaryDir)) {
        await dir.mkdirp(binaryDir)
    }

    const file = ctx.request.body.files.file

    const old = await Component.where({ name: name, version: version }).findOne().exec()
    if (old) {
        ctx.body = util.format('二进制文件已经存在 %s (%s)', name, version)
        return
    }

    const filePath = path.join(binaryDir, file.name)
    const reader = fs.createReadStream(file.path)
    const writer = fs.createWriteStream(filePath)
    reader.pipe(writer)

    let component = new Component
    component.name = name
    component.version = version
    try {
        await component.save()
    } catch (error) {
        console.log(error)
        ctx.body = error.message
        return
    }

    ctx.body = util.format('保存成功 %s (%s)', name, version)
}

async function destroy(ctx) {
    ctx.body = ctx.params
}

async function download(ctx) {
    console.log(ctx.params)
    ctx.body = ctx.params
}

module.exports = {
    show,
    create,
    destroy,
    download
}