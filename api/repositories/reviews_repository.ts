import mysql, { Connection } from 'mysql';

import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '../models/models';
import * as itemsRepo from './items_repository';

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

async function getUsernameFromUserIds(myConnection: Connection, userId: number) {
    return new Promise<string>(async (res, rej) => {
        myConnection.query(`SELECT username FROM users WHERE user_id = ${userId};`, (err, rows, fields) => {
            if(err)
                console.log(err);
            res(rows[0].username ? rows[0].username : '');
        });
    });
}

async function getReviewsRaw(myConnection: Connection, itemId: number) {
    return new Promise<Array<any>>(async (res, rej) => {
    myConnection.query(`SELECT * FROM reviews WHERE item_id = ${itemId};`, (err, rows, fields) => {
        if(err) 
            console.log(err);
        res(rows);
    });
    });
}

export async function getReviews(itemId: number) {
    return new Promise<Array<any>>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        const reviews: Array<any> = await getReviewsRaw(myConnection, itemId);
        const newReviewsArray: Array<any> = [];
        for(var i = 0; i < reviews.length; i ++) {
            const username = await getUsernameFromUserIds(myConnection, reviews[i].user_id);
            newReviewsArray.push({...reviews[i], "username": username});
        }
        myConnection.end();
        res(newReviewsArray);
    })
}

export async function postReviews(userId: number, itemId: number, content: string, rating: number) {
    return new Promise<number>(async (res, rej) => {
        let exitCode: number = Number(encodeUuidToNumber(uuidv4()));
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`INSERT INTO reviews VALUES(${exitCode}, ${userId}, ${itemId}, '${content}', ${rating}, '${jsDateToMysql(new Date())}')`, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res(1);
            } else {
                res(0);
            }
        })
        myConnection.end();
    })
}