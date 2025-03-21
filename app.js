const express=require('express')
const app=express()
require('dotenv').config()
const path=require('path')
const mongoose=require('mongoose')
const ejsMate=require('ejs-mate')
const session=require('express-session')
const brcypt=require('bcryptjs')
const multer=require('multer')
const cloud_db=process.env.CLOUD_DB
const {cloudinary,storage}=require('./cloudinary/index.js')
const upload=multer({storage})
const methodOverride=require('method-override')
const authorSchema=require('./models/authorSchema')
const blogSchema = require('./models/blogSchema')


app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"thisismysecret",resave:false,saveUninitialized:true}))

const protectRoute=(req,res,next)=>{
    if(req.session.user_id){
        return next()
    }
    else{
        res.redirect('/login')
    }
}

mongoose.connect(cloud_db).then(()=>{
    console.log("Connected")
}).catch((err)=>{
    console.log(err)
})

app.get("/",(req,res)=>{
    res.render('openingPage.ejs')
})
app.post("/login",async(req,res)=>{
    const {username,password} = req.body
    const usernameFound=await authorSchema.findOne({username:username})
    if(usernameFound){
        const compare=await brcypt.compare(password,usernameFound.password)
        if(compare){
            req.session.user_id=usernameFound._id
            res.redirect(`/homepage/${username}`)
        }
        else{
            res.render('loginPage',{error:'Something Went Wrong. Please Try Again'})
        }
    }
    else{
        res.render('loginPage',{error:'Something Went Wrong. Please Try Again'})
    }
})
app.post("/signup",upload.single('profile'),async (req,res)=>{
    const {name,username,password,email}=req.body
    const image_path=req.file.path
    const image_name=req.file.filename
    const salt=await brcypt.genSalt(10)
    const hash=await brcypt.hash(password,salt)
    const blogger=new authorSchema({
        name:name,
        username:username,
        password:hash,
        email:email,
        image_path:image_path,
        image_name:image_name
    })
    await blogger.save()
    res.redirect('/login')
})
app.post("/write/:username",async(req,res)=>{
    const {username}=req.params
    const {title,subtitle,content}=req.body
    const newBlog=new blogSchema({
        title:title,
        subtitle:subtitle,
        content:content,
        username:username
    })
    await newBlog.save()
    res.redirect(`../homepage/${username}`)
})
app.post("/forgetPassword",async(req,res)=>{
    const {email}=req.body
    const emailFound=await authorSchema.findOne({email:email})
    if(!emailFound){
        res.status(404).send('Email Not Found')
    }
    const password=emailFound.password

})
app.get("/login",(req,res)=>{
    res.render('loginPage.ejs',{error:null})
})
app.get("/signup",(req,res)=>{
    res.render('signupPage.ejs')
})
app.get("/homepage/:username",protectRoute,async(req,res)=>{
    const {username}=req.params
    const userdata=await authorSchema.findOne({username:username})
    const date=userdata.createdAt.toLocaleDateString()
    const time=userdata.createdAt.toLocaleTimeString()
    const blogData=await blogSchema.find({})
    res.render('homepage.ejs',{userdata:userdata,date:date,time:time,blogData:blogData})
})
app.get("/write/:username",protectRoute,(req,res)=>{
    const {username}=req.params
    res.render('write.ejs',{username:username})
})
app.get("/community/:username",protectRoute,async(req,res)=>{
    const {username}=req.params
    const blogData=await blogSchema.find({})
    res.render('community.ejs',{blogData:blogData,username:username})
})
app.get("/blog/:_id",protectRoute,async(req,res)=>{
    const {_id}=req.params
    const blogData=await blogSchema.findOne({_id:_id})
    const date=blogData.createdAt.toLocaleDateString()
    const time=blogData.createdAt.toLocaleTimeString()
    res.render('blog.ejs',{blogData:blogData,date:date,time:time})
})
app.get("/forgetPassword",(req,res)=>{
    res.render("forgotPassword.ejs")
})


app.listen(process.env.PORT || 3000)

