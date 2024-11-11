import fs from 'fs';
import path from 'path'
import { pool } from './db.js'
import { hash } from 'bcrypt'
import pkg from 'jsonwebtoken';
const { sign } = pkg;

const __dirname = import.meta.dirname;

const initializeTestDb = async () => {
    const sqlFilePath = path.join(__dirname, '../todo.sql');
    
    // Check if the file exists to debug
    console.log('SQL File Path:', sqlFilePath);
    
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    await pool.query(sql);
}

const insertTestUser = (email, password) => {
    return new Promise((resolve, reject) => {
        hash(password, 10, (error, hashedPassword) => {
            if (error) return reject(error);
            pool.query('insert into account (email, password) values ($1, $2)', [email, hashedPassword], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

const getToken = (email) => {
    return sign({user: email},process.env.JWT_SECRET_KEY)
}

export { initializeTestDb, insertTestUser, getToken }