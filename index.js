const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecretKey = "secretKey"
const app = express()
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt')
app.use(express.json())
app.get('/api', (req, res) => {
    res.json({
        message: "Hey there! welcome to this API service"
    })
})

const users = []
app.get('/users', (req, res) => {
    res.json(users)
})
app.post('/api/login', async (req, res, next) => {
    const user = users.find(user => user.email == req.body.email)
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

app.post('/api/post', verifyToken ,(req, res) => {
    jwt.verify(req.token, jwtSecretKey, (err, authData)=> {
        if(err) {
            res.sendStatus(403)
        } else {
            res.json({message: 'Posts success', authData})
        }
    })
})

app.post('/api/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const user = {email: req.body.email, password: hashedPassword}
        console.log(user)
        users.push(user)
        res.sendStatus(201)
    } catch {
        res.sendStatus(500)
    }
})

app.listen(PORT, (req, res) => {
    console.log(`server start on ${PORT}`)
})

