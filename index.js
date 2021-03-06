const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecretKey = "secretKey"
const app = express()
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt')

// mongoDB
const mongoose = require('mongoose')
// mongoose.Promise = global.Promise 
const { Schema } = mongoose

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on('error', (err) => console.error('connection error', err))
const blogSchema = new Schema({
    title:  String,
    author: String,
    body:   String,
    date: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true, 
        trim: true, 
        unique: true,
    },
    password: String
})
const User = mongoose.model('User', UserSchema)
// mongoDB end

app.use(express.json())

app.get('/api', (req, res) => {
    res.json({
        message: "Hey there! welcome to this API service"
    })
})


app.get('/users', (req, res) => {
    User.find((err, users)=> {
        if (err) {
            res.status(403).send(err)
        } else {
            res.json(users)
        }
    })
    
})
app.post('/api/login', async (req, res, next) => {
    
    const user = await User.findOne({email: req.body.email}).exec()
    
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            jwt.sign({user: user}, jwtSecretKey, (err, token) => {
                if (err) {
                    next(err)
                } else {
                    res.json({token})
                }
            })
        } else {
            next(new Error('login fail'))
        }
    } catch {
        res.status(500).send()
    }
})

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if (bearerHeader != null) {
        const bearerToken = bearerHeader.split(' ')[1]
        req.token = bearerToken
        next()
    } else {
        res.sendStatus(403)
    }
}

//Post
app.post('/api/post', verifyToken , (req, res) => {
    jwt.verify(req.token, jwtSecretKey, (err, authData) => {
        if(err) {
            res.status(403).send(err)
        } else {
            if (req.body.title == null || req.body.msg == null) {
                res.status(400).send('title == null || msg == null')
            }
            const blog = new Blog({
                title:  req.body.title,
                author: authData.user.name,
                body:   req.body.msg                    
            })
            blog.save()
                .then(item => {
                    res.json({message: 'Posts success', authData})
                })
                .catch(err =>{
                    res.status(400).send(err)
                })
        }
    })
})

app.get('/api/post', (req, res) => {
    Blog.find( (err, blogs) => {
        if (err) {
            res.status(400).send(err)
        } else {
            res.json(blogs)
        }
    })
})

app.post('/api/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const user = new User({name: req.body.email, email: req.body.email, password: hashedPassword}) 
        user.save()
            .then(item => {
                res.sendStatus(201)
            })
            .catch(err => {
                res.status(400).send(err)
            })

    } catch {
        res.sendStatus(500)
    }
})

app.delete('/api/register', verifyToken, async (req, res) => {
    jwt.verify(req.token, jwtSecretKey, (err, authData)=> {
        if (err) {
            res.sendStatus(500)
        } else {
            const email = authData.user.email
            const psw = authData.user.password

            User.findOne({email: email}).exec().then(user => {
                if (user == null) {
                    return res.status(400).send('Cannot find user')
                } else {
                    if (user.password == psw) {
                        User.deleteOne({email: email}).then(() =>{
                            res.json({success: true})
                        })
                    } else {
                        res.sendStatus(500)
                    }
                } 
            })
        }
         
    })
    
})

app.listen(PORT, (req, res) => {
    console.log(`server start on ${PORT}`)
})

