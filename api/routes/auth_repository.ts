
import { User, Item } from './models';
import argon2 from 'argon2';
import mysql from 'mysql';
import 'dotenv/config';

const mysqlUser: string = process.env.MYSQL_USER == undefined ? '' : process.env.MYSQL_USER;
const mysqlPassword: string = process.env.MYSQL_PASSWORD == undefined ? '' : process.env.MYSQL_PASSWORD;
const mysqlDBName: string = process.env.MYSQL_DBNAME == undefined ? '' : process.env.MYSQL_DBNAME;


async function connection(databaseName: string) {
    return mysql.createConnection({
        host: 'localhost',
        user: mysqlUser,
        password: mysqlPassword,
        database: databaseName,
    })
}


export async function findUser(username: string) {
    // finding the user by username
    const found = false;
    console.log(`user with username ${username} is being searched`);

    let user: User;

    const myConnection = await connection(mysqlDBName);
    myConnection.connect();
    myConnection.query(`SELECT username FROM users WHERE username = ${username} `, (err, rows, field) => {
        // handle the query result
        console.log(`user found is: ${rows[0]} `);
    });
    myConnection.end();


    username = "";
    const email = "";
    const password = "$argon2id$v=19$m=65536,t=3,p=4$BosDtEuUiEYBEaKKF46mPA$7XhuZDCBuRdpi4e2CkeIWAXfR1pCZmixW76CJCx47HY";
    user = new User(username, email, password, );
    if(found) {
        return user;
    }
    return found;
}

export async function createUser(user: User) {
    // finding the user by username
    console.log(`user being created -> ${user.username}, ${user.email}, with password ${user.password}`);
    return {'succ': true, 'message': "User has been successfully created, please proceed to Login"};
}


export async function updateLastLoggedIn(username: string, date: Date) {
    // parse from string and then put the date back into mysql formatted string
    return {'succ': true};
}

export async function verifyPassword(hashedPassword: string, password: string) {
    return await argon2.verify(hashedPassword, password);
}

export async function hashedPassword(password: string) {
    return await argon2.hash(password);
}