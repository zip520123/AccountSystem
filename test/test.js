const assert = require('assert')
const http = require('http')
const axios = require('axios')
const crypto = require('crypto')
require('dotenv').config()
const host = process.env.HOST
const port = process.env.PORT

describe('login', () => {
    const url = host + ':' + port + '/api/login'
    
    it('John can login', (done)=> {
        const email = 'john@example.com'
        const pwd = "johnsonGG123"
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')

        axios.post(url, { email: email, passwdhash: passwdhash})
        .then(res => {
            done()
        })
        .catch(err =>{
            done(err)
        })
    })

    it('John can login and get jwt token', (done)=> {
        const email = 'john@example.com'
        const pwd = "johnsonGG123"
        const passwdhash = crypto.createHash('sha256').update(pwd).digest('base64')
        
        axios.post(url, { email: email, passwdhash: passwdhash})
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
        axios.post(url, { email: email, passwdhash: passwdhash})
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

    it('John can post msg with its token', (done)=>{
        const headers = {
            Authorization: `Bearer ${token}`
        }
        axios.post(postMsgUrl, {msg: "hello"}, { headers: headers } )
        .then(res => {
            assert.notStrictEqual(res.data.token, null, "token must not be nil")
            done()
        })
        .catch(err =>{
            done(err)
        })
    })


})


describe('testApi', ()=> {
    it('testApi', (done)=> {
        var url = host + ':' + port + '/api'
        axios
            .get(url)
            .then(res => {
                // console.log(`statusCode: ${res.status}`)
                // console.log(`${res.data.message}`)
                done()
            })
            .catch(error => {
                // console.error(error)
                done(error)
            })
    })
})
