const fs = require('fs-promise')
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

function binaryDir(name, version) {
    const rootDir = path.dirname(require.main.filename)
    const binaryRoot = path.join(rootDir, '.binary-server')
    const binaryDir = path.join(binaryRoot, name, version)
    return binaryDir
}

module.exports = {
    mkdirp,
    binaryDir
}