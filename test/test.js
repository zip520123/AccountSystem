const assert = require('assert')
const http = require('http')
const axios = require('axios')
const crypto = require('crypto')
require('dotenv').config()
const host = process.env.HOST
const port = process.env.PORT

describe('user can register and delete account', () => {
    const retisterUrl = host + ':' + port + '/api/register'
    it('Alice can register and login', (done)=> {
        const email = 'alice@example.com'
        const pwd = "aliceGG123"
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')

        axios.post(retisterUrl, { email: email, password: passwdhash})
        .then(res => {
            const loginUrl = host + ':' + port + '/api/login'
            return axios.post(loginUrl, { email: email, password: passwdhash })
        })
        .then(res => {
            done()
        })
        .catch(err => {
            done(err)
        })
    })

    it('Bob can register, login and delete account with token', (done) => {
        const email = 'bob@example.com'
        const pwd = 'bob123'
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')
        axios.post(retisterUrl, { email: email, password: passwdhash})
        .then(res => {
            const loginUrl = host + ':' + port + '/api/login'
            return axios.post(loginUrl, { email: email, password: passwdhash })
        })
        .then(res => {
            return res.data.token
        })
        .then(token => {
            const headers = {
                Authorization: `Bearer ${token}`
            }
            return axios.delete(retisterUrl, {headers: headers})
        })
        .then(res => {
            const loginUrl = host + ':' + port + '/api/login'
            axios.post(loginUrl, { email: email, password: passwdhash })
            .then(res => {
                done(new Error('bob login success after delete account'))
            })
            .catch(err => {
                done()
            })
        })
        .catch(err => {
            done(err)
        })
    })

    it('Bob cannot delete account with wrong token', (done) => {
        const email = 'bob@example.com'
        const pwd = 'bob123'
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')
        axios.post(retisterUrl, { email: email, password: passwdhash})
        .then(res => {
            const loginUrl = host + ':' + port + '/api/login'
            return axios.post(loginUrl, { email: email, password: passwdhash })
        })
        .then(res => {
            return "wrong token"
        })
        .then(token => {
            const headers = {
                Authorization: `Bearer ${token}`
            }
            return axios.delete(retisterUrl, {headers: headers})
        })
        .catch(err => {
            done()
        })
    })
})

describe('login', () => {
    const loginUrl = host + ':' + port + '/api/login'
    describe('John can login', () => {
        const email = 'john@example.com'
        const pwd = "johnsonGG123"
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')
        const retisterUrl = host + ':' + port + '/api/register'
        axios.post(retisterUrl, { email: email, password: passwdhash})
        .then(res => {
            const loginUrl = host + ':' + port + '/api/login'
            return axios.post(loginUrl, { email: email, password: passwdhash})
        }).then(res => {
            done()
        }).catch(err =>{
            done(err)
        })
    })
    

    it('John can login and get jwt token', (done)=> {
        const email = 'john@example.com'
        const pwd = "johnsonGG123"
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')
        
        axios.post(loginUrl, { email: email, password: passwdhash})
        .then(res => {
            assert.notStrictEqual(res.data.token, null, "token must not be nil")
            done()
        })
        .catch(err =>{
            done(err)
        })
    })

    it('Nini cannot login', (done)=> {
        const email = 'Nini@gmail.com'
        const pwd = 'NiniSucksGG'
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')
        axios.post(loginUrl, { email: email, password: passwdhash})
        .then(res => {
            done(new Error('NiNi login success'))
        })
        .catch(err =>{
            done()
        })
    })
})



describe('Post message', ()=> {
    
    const postMsgUrl = host + ':' + port + '/api/post'
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJuYW1lIjoiSm9obiIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInBhc3N3ZGhhc2giOiI4Z051ckd1d0RwSk9Qclc4a0V5L0hCM0NLMWs1N1lkcFRRTmFoU3ZpbTJRPSJ9LCJpYXQiOjE2MjI1NTcxOTR9.2YxUk7rpgo5QaBXLHb_WtCXt-vEz245MuZt_grEn9WE"

    it('Cannot post msg without token', (done)=>{
        axios.post(postMsgUrl, { msg: "hello"})
        .then(res => {
            done(new Error('Cannot post msg without token'))
        })
        .catch(err =>{
            done()
        })
    })
    
    it('John can post msg with its token', (done) => {
        const headers = {
            Authorization: `Bearer ${token}`
        }
        axios.post(postMsgUrl, {title: "I'm title", msg: "hello"}, { headers: headers } )
        .then(res => {
            assert.notStrictEqual(res.data.token, null, "token must not be nil")
            done()
        })
        .catch(err =>{
            done(err)
        })

    })


    it('John can not post msg with wrong token', (done) => {
        const headers = {
            Authorization: `Bearer wrongToken`
        }
        axios.post(postMsgUrl, {msg: "hello"}, { headers: headers } )
        .then(res => {
            done(new Error('Cannot post msg with wrong'))
        })
        .catch(err =>{
            done()
        })
    })
})

describe('Get posts', () => {
    const postMsgUrl = host + ':' + port + '/api/post'
    it('User can load the posts', (done) => {
        axios.get(postMsgUrl, {

        }).then(res => {
            done()
        }).catch(err =>{
            done(new Error('get post api fail'))
        })
    })
})