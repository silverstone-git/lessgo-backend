import { Item } from "./models";
import mysql, { Connection } from 'mysql';

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



export async function post(item: Item) {
    //add a post
    return new Promise<number>(async (resolve, reject) => {
        let exitCode = 0;
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
        INSERT INTO
        items
        VALUES (
            ${encodeUuidToNumber(uuidv4())},
            '${item.itemName}',
            '${item.description}',
            '${item.category}',
            ${item.inStock},
            ${item.priceRs},
            '${jsDateToMysql(new Date())}',
            '${item.image}',
            '${item.video}'
        );
        `, (err, rows, fields) => {
            if(err) {
                console.log(err);
                exitCode = -2;
            }
        });
        myConnection.end();
        resolve(exitCode);
    })
}