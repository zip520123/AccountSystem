const e = require('express');
const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const PORT = process.env.PORT || 3000;
app.use(express.json())
app.get('/api', (req, res) => {
    res.json({
        message: "Hey there! welcome to this API service"
    })
})

const db = {}
db.user1 = {
    id: 1,
    name: 'John',
    email: 'john@example.com',  
    passwdhash: '8gNurGuwDpJOPrW8kEy/HB3CK1k57YdpTQNahSvim2Q='
}   

app.post('/api/login',  (req, res, next) => {
    let john = db.user1
    console.log(john, req.body)
    if (req.body.email === john.email && req.body.passwdhash === john.passwdhash) {
        jwt.sign({user: john}, "secretKey", (err, token) => {
            if (err) {
                next(err)
            } else {
                res.json({token})
            }
        })
    } else {
        next(new Error('login fail'))
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

    res.json({message: 'Posts success'})
})



app.listen(PORT, (req, res) => {
    console.log(`server start on ${PORT}`)
})

