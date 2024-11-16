    const mongoose=require('mongoose')
    const Schema=mongoose.Schema
    const authorSchema=new Schema({
        name:{
            type:String,
            required: true,
        },
        username:{
            type:String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique:true
        },
        image_path:{
            type:String,
            required:true
        },
        image_name:{
            type:String,
            required:true
        },
        createdAt:{
            type: Date,
            default: Date.now
        }
    })

    module.exports=mongoose.model('authorSchema',authorSchema)