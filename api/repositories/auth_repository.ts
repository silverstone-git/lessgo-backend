
import { User } from '../models/models';
import argon2 from 'argon2';
import mysql, { Connection } from 'mysql';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { jsDateToMysql } from '../common/dates';

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


export function encodeUuidToNumber(myUuid: string) {
    let i: number;
    let numString = "";
    for(i = 0; i < myUuid.length; i ++) {
        numString += myUuid[i].charCodeAt(0).toString();
    }
    numString = numString.substring(0, 9);
    return numString;
}


export async function getUserByEmail(email: string, passedConnection: Connection | boolean = false, oauth: string = '') {
    // finding the user by username
    // 

    let user: User = User.johnDoe();

    if(typeof passedConnection != 'boolean') {
        // if already a connection exists, the function uses that
        // instead of making a new one, used in batch actions where
        // the user's presence in db is needed to be validated
        return new Promise<User>(async (resolve, reject) => {
            // handler
            passedConnection.query(`SELECT * FROM users WHERE email = '${email}' ${oauth ? ' AND auth_type = "' + oauth + '" ': ''} ;`, (err, rows, fields) => {
                // handle the query result
                if(err) {
                    console.log(err);
                    resolve(user);
                }
                if(rows[0]) {
                    user = User.fromMap(rows[0]);
                    resolve(user);
                } else {
                    // console.log("USER NOT FOUND")
                    resolve(user);
                }
            });
        });
    } else {
    
        const myConnection = await connection(mysqlDBName);
        return new Promise<User>(async (resolve, reject) => {
            myConnection.connect();
            myConnection.query(`SELECT * FROM users WHERE email = '${email}' ${oauth ? ' AND auth_type = "' + oauth + '" ': ''} ;`, (err, rows, fields) => {
                // handle the query result
                if(err) {
                    console.log(err);
                    resolve(user);
                }
                if(rows[0]) {
                    user = User.fromMap(rows[0]);
                    resolve(user);
                } else {
                    // console.log("USER NOT FOUND");
                    resolve(user);
                }
            });
            myConnection.end();
        });
    }

}


export async function loginUser(email: string, enteredPassword: string, oauth: string = 'argon') {

    return new Promise<User | number>(async (resolve, reject) => {
        const connectionForLogIn = await connection(mysqlDBName);
        connectionForLogIn.connect();
        const userInDB: User = await getUserByEmail(email, connectionForLogIn, oauth);
        if(userInDB.username != "") {
            // the case when user is found in the database
            let isVerified;
            if(userInDB.authType === 'argon') {
                isVerified = await verifyPassword(userInDB.password, enteredPassword);
            }
            else if(userInDB.authType === 'google') {
                // check authentication via google
                // you want to confirm whether the account logged in the browser is
                // the same as the user info stored in the database
                // until then..
                isVerified = false;
            } else {
                isVerified = false;
            }
            if(isVerified) {
                await updateLastLoggedIn(email, new Date(), connectionForLogIn);
                connectionForLogIn.end();
                resolve(userInDB);
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

async function createUserCore(myConnection: Connection, user: User, oauth: boolean) {
    return new Promise<number> ((res, rej) => {
    let exitCode = 0;
    myConnection.query(`
    INSERT INTO
    users (user_id, username, email, password, is_vendor, joined_dt, auth_type, dp)
    VALUES (
    ${oauth ? encodeUuidToNumber(user.email) : encodeUuidToNumber(uuidv4())},
    '${user.username}',
    '${user.email}',
    '${user.password}',
    ${user.isVendor},
    '${jsDateToMysql(new Date())}',
    '${user.authType}',
    '${user.dp}'
    );
    `,
    (err, rows, fields) => {
        if(err) {
            console.log(err);
            exitCode = -2;
        }
    });
    res(exitCode);
    })
}

export async function createUser(user: User, oauth: boolean = false) {
    // finding the user by username
    return new Promise<number>(async (res, rej) => {
    const connectionForCreate = await connection(mysqlDBName);
    connectionForCreate.connect();
    let exitCode = 0;
    const userAlreadyInDb: User = await getUserByEmail(user.email, connectionForCreate, oauth ? 'google' : 'argon');
    if(userAlreadyInDb.username !== '') {
        exitCode = 409;
        res(exitCode)
        return exitCode;
    }
    const exitCodeCore = await createUserCore(connectionForCreate, user, oauth);
    exitCodeCore === 0 ? exitCode = 0: console.log();
    connectionForCreate.end();
    res(exitCode);
    return exitCode;
    });
    // }
}


export async function updateLastLoggedIn(email: string, date: Date,  passedConnection: Connection | boolean = false) {
    // parse from string and then put the date back into mysql formatted string
    if(typeof passedConnection != 'boolean') {
        return new Promise<object>((resolve, reject) => {
            passedConnection.query(`UPDATE users SET last_login = '${jsDateToMysql(date)}' WHERE email = '${email}'`, (error, rows, fields) => {
                // handler func for result of 
                if(error) {
                    // console.log(error);
                    resolve({'succ': false});
                }
                resolve({'succ': true});
            });
        })
    } else {
        const myConnection = await connection(mysqlDBName);
        return new Promise<object>((resolve, reject) => {
            myConnection.connect();
            myConnection.query(`UPDATE users SET last_login = '${jsDateToMysql(date)}' WHERE username = '${email}'`, (error, rows, fields) => {
                // handler func for result of 
                if(error) {
                    // console.log(error);
                    resolve({'succ': false})
                }
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

export async function getUserAddress(myConnection: Connection, userId: number) {
    return new Promise<string>(async (res, rej) => {
        myConnection.query(`SELECT address FROM users WHERE user_id = '${userId}' `, async (err, rows, fields) => {
            if(err) {
                console.log(err);
                res('');
            } else {
                if(rows[0]) {
                    res(rows[0].address ? rows[0].address : '');
                } else {
                    res('');
                }
            }
        })
    })
}


export async function getUserAddressForce(userId: number) {
    return new Promise<string>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        const addressFromTable = await getUserAddress(myConnection, userId);
        res(addressFromTable);
        myConnection.end();
    })
}

