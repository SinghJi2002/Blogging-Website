const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subtitle:{
        type:String,
        required:true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    username:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('blogSchema', blogSchema);
