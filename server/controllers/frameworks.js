'use strict'

require('../models/component')

const dir = require('../utils/dir')
const path = require('path')
const fs = require('fs')
const fsp = require('fs-promise')
const os = require('os')
const util = require('util')
const koaBody = require('koa-body')

// /usr/local/var/mongodb
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

    const name = ctx.request.body.fields.name
    const version = ctx.request.body.fields.version

    const binaryDir = dir.binaryDir(name, version)
    if (!fs.existsSync(binaryDir)) {
        await dir.mkdirp(binaryDir)
    }

    const file = ctx.request.body.files.file

    let component = await Component.where({ name: name, version: version }).findOne().exec()
        // let oldFiles = await fsp.readdir(binaryDir)
        // oldFiles = oldFiles.filter((name) => { return name == file.name })
    if (component) {
        ctx.body = util.format('二进制文件已经存在 %s (%s)', name, version)
        return
    }

    const filePath = path.join(binaryDir, file.name)
    const reader = fs.createReadStream(file.path)
    const writer = fs.createWriteStream(filePath)
    reader.pipe(writer)

    component = new Component
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
    const name = ctx.params.name
    const version = ctx.params.version

    const component = await Component.where({ name: name, version: version }).findOne().exec()
    if (!component) {
        ctx.body = util.format('无二进制文件 %s (%s)', name, version)
        return
    }

    const binaryDir = path.join(dir.binaryRoot(), name)
    if (fs.existsSync(binaryDir)) {
        await dir.rmdir(binaryDir)
    }

    try {
        await component.remove().exec()
            // await Component.remove({ name: name, version: version })
    } catch (error) {
        console.log(error)
        ctx.body = error.message
        return
    }

    ctx.body = util.format('删除成功 %s (%s)', name, version)
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