const fs = require('fs-promise')
const rimraf = require('rimraf')
const path = require('path')

function mkdirp(dirname) {
    return new Promise((resolve, reject) => {
        fs.exists(dirname)
            .then((exists) => {
                if (exists) {
                    resolve()
                } else {
                    mkdirp(path.dirname(dirname))
                        .then(() => {
                            fs.mkdir(dirname).then(() => {
                                resolve()
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                }
            })
    })
}

function rmdir(dirname) {
    return new Promise((resolve, reject) => {
        rimraf(dirname, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve(resolve)
            }
        })
    })
}

function binaryRoot() {
    const rootDir = path.dirname(require.main.filename)
    const binaryRoot = path.join(rootDir, '.binary')
    return binaryRoot
}

function binaryDir(name, version) {
    return path.join(binaryRoot(), name, version)
}

module.exports = {
    mkdirp,
    rmdir,
    binaryRoot,
    binaryDir
}