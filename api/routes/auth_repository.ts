
import { User } from './models';
import argon2 from 'argon2';
import mysql, { Connection } from 'mysql';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

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


function jsDateToMysql(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function encodeUuidToNumber(myUuid: string) {
    let i: number;
    let numString = "";
    for(i = 0; i < myUuid.length; i ++) {
        numString += myUuid[i].charCodeAt(0).toString();
    }
    numString = numString.substring(0, 9);
    return numString;
}


export async function findUser(username: string, passedConnection: Connection | boolean = false) {
    // finding the user by username
    let found = false;

    let user: User = new User('', '', '');

    if(typeof passedConnection != 'boolean') {
        // if already a connection exists, the function uses that
        // instead of making a new one, used in batch actions where
        // the user's presence in db is needed to be validated
        return new Promise<User>(async (resolve, reject) => {
            // handler
            passedConnection.query(`SELECT * FROM users WHERE username = '${username}' `, (err, rows, fields) => {
                // handle the query result
                if(err) {
                    console.log(err);
                    resolve(user);
                }
                if(rows[0]) {
                    found = true;
                    user = User.fromMap(rows[0]);
                    resolve(user);
                } else {
                    console.log("USER NOT FOUND")
                    resolve(user);
                }
            });
        });
    } else {
    
        const myConnection = await connection(mysqlDBName);
        return new Promise<User>(async (resolve, reject) => {
            myConnection.connect();
            myConnection.query(`SELECT * FROM users WHERE username = '${username}' `, async (err, rows, fields) => {
                // handle the query result
                if(err) {
                    console.log(err);
                    resolve(user);
                }
                if(rows[0]) {
                    found = true;
                    user = User.fromMap(rows[0]);
                    resolve(user);
                } else {
                    console.log("USER NOT FOUND");
                    resolve(user);
                }
            });
            myConnection.end();
        });
    }

}


export async function loginUser(username: string, enteredPassword: string) {

    return new Promise<number>(async (resolve, reject) => {
        const connectionForLogIn = await connection(mysqlDBName);
        connectionForLogIn.connect();
        const userInDB: User = await findUser(username, connectionForLogIn);
        if(userInDB.username != "") {
            // the case when user is found in the database
            const isVerified = await verifyPassword(userInDB.password, enteredPassword);
            if(isVerified) {
                console.log('password has been confirmed in login user function!');
                await updateLastLoggedIn(username, new Date(), connectionForLogIn);
                connectionForLogIn.end();
                resolve(1);
            } else {
                connectionForLogIn.end();
                resolve(0);
            }
        } else {
            connectionForLogIn.end();
            resolve(-1);
        }
    })
}

export async function createUser(user: User) {
    // finding the user by username
    const connectionForCreate = await connection(mysqlDBName);
    connectionForCreate.connect();
    // const foundUser = await findUser(user.username, connectionForCreate);
    // if(foundUser.username != "") {
        // connectionForCreate.end();
        // return -1;
    // } else {
        // create the user here
    let exitCode = 0;
    connectionForCreate.query(`INSERT INTO
    users (user_id, username, email, password, joined_dt)
    VALUES (
    ${encodeUuidToNumber(uuidv4())},
    '${user.username}',
    '${user.email}',
    '${user.password}',
    '${jsDateToMysql(new Date())}'
    )
    `, (err, rows, fields) => {
        if(err) {
            console.log(err);
            exitCode = -2;
        }
        console.log("user has been created successfully!!");
        exitCode = 0;
    })
    connectionForCreate.end();
    return exitCode;
    // }
}


export async function updateLastLoggedIn(username: string, date: Date,  passedConnection: Connection | boolean = false) {
    // parse from string and then put the date back into mysql formatted string
    if(typeof passedConnection != 'boolean') {
        return new Promise<object>((resolve, reject) => {
            passedConnection.query(`UPDATE users SET last_login = '${jsDateToMysql(date)}' WHERE username = '${username}'`, (error, rows, fields) => {
                // handler func for result of 
                if(error) {
                    console.log(error);
                }
                console.log("update last logged in has been successfully executed");
                resolve({'succ': true});
            });
        })
    } else {
        const myConnection = await connection(mysqlDBName);
        return new Promise<object>((resolve, reject) => {
            myConnection.connect();
            myConnection.query(`UPDATE users SET last_login = '${jsDateToMysql(date)}' WHERE username = '${username}'`, (error, rows, fields) => {
                // handler func for result of 
                if(error) {
                    console.log(error);
                }
                console.log("update last logged in has been successfully executed");
                resolve({'succ': true});
            });
            myConnection.end()
        })
    }
}

async function verifyPassword(hashedPassword: string, password: string) {
    return await argon2.verify(hashedPassword, password);
}

export async function hashedPassword(password: string) {
    return await argon2.hash(password);
}