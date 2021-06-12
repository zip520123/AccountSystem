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

const users = {}
app.get('/users', (req, res) => {
    res.json(users)
})
app.post('/api/login', async (req, res, next) => {
    const user = users[req.body.email]
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
            res.status(403).send(err)
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
        users[user.email] = user
        res.sendStatus(201)
    } catch {
        res.sendStatus(500)
    }
})

app.delete('/api/register', verifyToken, async (req, res) => {
    jwt.verify(req.token, jwtSecretKey, (err, authData)=> {
        if (err) {
            res.sendStatus(500)
        } else {
            console.log(authData)
            const email = authData.user.email
            const psw = authData.user.password
            const user = users[email]
            if (user == null) {
                return res.status(400).send('Cannot find user')
            } else {
                if (user.password == psw) {
                    users[user.email] = null
                    res.json({success: true})
                } else {
                    res.sendStatus(500)
                }
            } 
        }
         
    })
    
})

app.listen(PORT, (req, res) => {
    console.log(`server start on ${PORT}`)
})

