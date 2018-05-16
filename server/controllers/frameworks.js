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
    const name = ctx.params.name
    const version = ctx.params.version
    let conditions = {}

    if (name && version) {
        conditions = { name: name, version: version }
    }

    let names = ctx.params.names
    if (names) {
        names = names.split(',')
        conditions = { name: { $in: names } }
    }

    const components = await Component.find(conditions).exec()

    let body = {}
    for (const i in components) {
        let name = components[i].name
        body[name] = body[name] || []
        body[name].push(components[i].version)
    }

    ctx.body = body
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
        ctx.status = 404
        ctx.body = util.format('无二进制文件 %s (%s)', name, version)
        return
    }

    const binaryDir = path.join(dir.binaryRoot(), name)
    if (fs.existsSync(binaryDir)) {
        await dir.rmdir(binaryDir)
    }

    try {
        await Component.remove({ name: name, version: version })
    } catch (error) {
        console.log(error)
        ctx.body = error.message
        return
    }

    ctx.body = util.format('删除成功 %s (%s)', name, version)
}

async function download(ctx) {
    const name = ctx.params.name
    const version = ctx.params.version

    const component = await Component.where({ name: name, version: version }).findOne().exec()

    if (!component) {
        ctx.status = 404
        ctx.body = util.format('无二进制文件 %s (%s)', name, version)
        return
    }

    const binaryDir = dir.binaryDir(name, version)
    const binaryFiles = await fsp.readdir(binaryDir)
    const binaryFile = binaryFiles.shift()
    if (!binaryFile) {
        ctx.status = 404
        ctx.body = util.format('无二进制文件 %s (%s)', name, version)
        return
    }

    const binaryPath = path.join(binaryDir, binaryFile)
    ctx.type = path.extname(binaryPath)
    ctx.body = fs.createReadStream(binaryPath)
}

module.exports = {
    show,
    create,
    destroy,
    download
}