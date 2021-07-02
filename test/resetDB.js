const mongoose = require('mongoose')
// mongoose.Promise = global.Promise 
const { Schema } = mongoose

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true})
const UserSchema = new Schema({
    name: String,
    email: String,
    password: String
})
const User = mongoose.model('User', UserSchema)
const db = mongoose.connection
db.on('error', (err) => console.error('connection error', err))

const blogSchema = new Schema({
    title:  String,
    author: String,
    body:   String,
    date: { type: Date, default: Date.now }
})

const Blog = mongoose.model('Blog', blogSchema)

let deleteProcess = () => {
    User.deleteMany({}).exec()
    .then(()=> {
        console.log("delete Users success")
        return Blog.deleteMany({}).exec()
    })
    .then(()=> {
        console.log("delete Blogs success")
        db.close()
    }).catch(err =>{
        console.log(err)
        db.close()
    })
}
deleteProcess()