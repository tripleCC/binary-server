'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ComponentSchema = new Schema({
    name: String,
    version: String,
    annotate: String,
    sha: String,
    create_at: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('Component', ComponentSchema)