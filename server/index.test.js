import { expect } from "chai"
import { getToken, initializeTestDb, insertTestUser  } from "./helpers/test.js";
import fetch from 'node-fetch';

const base_url = 'http://localhost:3001';

    before(async () => {
        await initializeTestDb()
    })

describe('GET tasks',() => {
    it ('should get all tasks',async() => {
        const response = await fetch(base_url + '/tasks')
        const data = await response.json()

        expect(response.status).to.equal(200)
        expect(data).to.be.an('array').that.is.not.empty
        expect(data[0]).to.include.all.keys('id', 'description')
    })
})

describe('POST task',() => {
    let token
    before(async () => {
        const email = 'post@foo.com'
        const password = 'post123'
        await insertTestUser(email,password)
        token = getToken(email)
    })

    it ('should post a task',async() => {
        const response = await fetch(base_url + '/tasks/create', {
            method: 'post',
            headers: {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({'description':'Task from unit test'})
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.be.an('object')
        expect(data).to.include.all.keys('id')
    })

    it ('should not post a task without description', async () => {
        const response = await fetch(base_url + '/tasks/create',{
            method: 'post',
            headers: {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({description: null})
        })
        const data = await response.json()
        expect(response.status).to.equal(500)
        expect(data).to.be.an('object')
        expect(data).to.include.all.keys('error')
    })
})

describe('DELETE task',() => {
    let token
    before(async () => {
        const email = 'delete@foo.com'
        const password = 'delete123'
        insertTestUser(email,password)
        token = getToken(email)
    })

    it ('should delete a task',async() => {
        const response = await fetch(base_url + '/tasks/delete/1', {
            method: 'delete',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.be.an('object')
        expect(data).to.include.all.keys('id')
    })

    it ('should not delete a task with SQL injection', async () => {
        const response = await fetch(base_url + '/tasks/delete/id=0 or id > 0',{
            method: 'delete',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(500)
        expect(data).to.be.an('object')
        expect(data).to.include.all.keys('error')
    })   
})

describe('POST register', () => {

    it ('should register with valid email and password', async() => {
        const email = 'register@foo.com'
        const password = 'register123'

        const response = await fetch(base_url + '/user/register', {
            method: 'post',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.be.an('object')
        expect(data).to.include.all.keys('id','email')
    })
})

describe('POST login',() => {
    let token
    const email = 'login@foo.com'
    const password = 'login123'

    before(async () => {
        await insertTestUser(email,password)
        token = await getToken(email)
    })

    it ('should login with valid credentials', async() => {
        const response = await fetch(base_url + '/user/login', {
            method: 'post',
            headers: {
                'Content-Type':'application/json',
                //Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()
        expect(response.status).to.equal(200,data.error)
        expect(data).to.be.an('object')
        expect(data).to.include.all.keys('id','email','token')
    })
})