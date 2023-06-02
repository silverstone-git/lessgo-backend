
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
    console.log(`user with username ${username} is being searched`);

    let user: User = new User('', '', '');

    if(typeof passedConnection != 'boolean') {
        // if already a connection exists, the function uses that
        // instead of making a new one, used in batch actions where
        // the user's presence in db is needed to be validated
        await passedConnection.query(`SELECT * FROM users WHERE username = '${username}' `, async (err, rows, fields) => {
            // handle the query result
            console.log(`received result for SELECT is: ${rows}, ${typeof rows}, ${err} `);
            if(rows.length > 0) {
                found = true;
                console.log(`user found in findUser is: ${rows[0]} `);
                user = User.fromMap(rows[0]);
                console.log(`user ${user.username} made from result row is: ${user}`);
            } else {
                console.log("the user wasnt found! keeping found as false only")
            }
        });
    } else {
        //
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        await myConnection.query(`SELECT * FROM users WHERE username = '${username}' `, async (err, rows, fields) => {
            // handle the query result
            console.log(`received result for SELECT is: ${rows}, ${typeof rows}, ${err} `);
            if(rows.length > 0) {
                found = true;
                console.log(`user found in findUser is: ${rows[0]} `);
                user = User.fromMap(rows[0]);
            } else {
                console.log("the user wasnt found! keeping found as false only");
            }
        });
        myConnection.end();
    }

    return user;

}


export async function loginUser(username: string, enteredPassword: string) {

    const connectionForLogIn = await connection(mysqlDBName);
    connectionForLogIn.connect();
    console.log(`searching for the user in login......`);
    const userInDB = await findUser(username, connectionForLogIn);
    console.log(`user in db is: ${userInDB}, ${userInDB.username} ${userInDB.password} ${userInDB.email} ${userInDB.joinedDt}`);
    if(userInDB.username != "") {
        // the case when user is found in the database
        if(await verifyPassword(userInDB.password, enteredPassword)) {
            console.log('password has been confirmed in login user function!');
            await updateLastLoggedIn(username, new Date(), connectionForLogIn);
            connectionForLogIn.end();
            return 1;
        } else {
            connectionForLogIn.end();
            return 0;
        }
    } else {
        connectionForLogIn.end();
        return -1;
    }
}

export async function createUser(user: User) {
    // finding the user by username
    console.log(`user being created -> ${user.username}, ${user.email}, with password ${user.password}`);
    const connectionForCreate = await connection(mysqlDBName);
    connectionForCreate.connect();
    const foundUser = await findUser(user.username, connectionForCreate);
    if(foundUser.username != "") {
        connectionForCreate.end();
        return -1;
    } else {
        // create the user here
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
                throw err;
            }
            console.log("user has been created successfully!!");
        })
        connectionForCreate.end();
        return 0;
    }
}


export async function updateLastLoggedIn(username: string, date: Date,  passedConnection: Connection | boolean = false) {
    // parse from string and then put the date back into mysql formatted string
    if(typeof passedConnection != 'boolean') {
        passedConnection.query(`UPDATE users SET last_login = '${jsDateToMysql(date)}' WHERE username = ${username}`, (error, rows, fields) => {
            // handler func for result of 
            if(error) {
                throw error;
            }
            console.log("update last logged in has been successfully executed");
        });
    } else {
        //
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`UPDATE users SET last_login = '${jsDateToMysql(date)}' WHERE username = ${username}`, (error, rows, fields) => {
            // handler func for result of 
            if(error) {
                throw error;
            }
            console.log("update last logged in has been successfully executed");
        });
        myConnection.end()
    }
    return {'succ': true};
}

export async function verifyPassword(hashedPassword: string, password: string) {
    return await argon2.verify(hashedPassword, password);
}

export async function hashedPassword(password: string) {
    return await argon2.hash(password);
}