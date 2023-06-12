
import mysql, { Connection } from 'mysql';

import { v4 as uuidv4 } from 'uuid';
import { CartItem } from './models';

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


export async function addToCart(userId: string, cart: Object) {
    // insert the given username, items and count into the orders table

    return new Promise<number>(async (resolve, reject) => {
        let exitCode = 0;
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        for(const [key, value] of Object.entries(cart)) {
            myConnection.query(`
            INSERT INTO
            orders (order_id, user_id, item_id, status, count, cart_at)
            VALUES (
                ${encodeUuidToNumber(uuidv4())},
                ${userId},
                ${key},
                2,
                ${value},
                '${jsDateToMysql(new Date())}'
            );
            `, (err, rows, fields) => {
                if(err) {
                    console.log(err);
                    exitCode = 1;
                }
            });
        }
        myConnection.end();
        resolve(exitCode);
    })
}


async function getOrdersFromUserId(myConnection: Connection, userId: number, statusCode: number) {
    //
    return new Promise<Array<any>>(async (resolve, reject) => {
        const cart: Array<any> = [];
        myConnection.query(`
        SELECT item_id, count, cart_at FROM orders WHERE user_id = ${userId} AND status = ${statusCode};
        `, (err, rows, fields) => {
            //
            if(err) {
                console.log("error while doing querying orders");
                console.log(err);
                resolve([]);
            }
            if(rows[0]) {
                let i: number = 0;
                for(i = 0; i < rows.length; i ++) {
                    // rows is nothing but an array of maps
                    cart.push(rows[i] as Object);
                }
                resolve(cart)
            } else {
                // console.log("no hits for such order");
                resolve([]);
            }
        });
    })
}


async function getCartItemFromId(myConnection: Connection, cartObj: any) {
    return new Promise<CartItem>((resolve, reject) => {
        myConnection.query(`
            SELECT * FROM items WHERE item_id = ${cartObj.item_id};
            `, (err, rows, fields) => {
                //
                if(err) {
                    console.log(err);
                }
                if(rows[0]) {
                    let cartItemMap = {...rows[0], "count": cartObj.count, "cart_at": cartObj.cart_at};
                    resolve(CartItem.fromMap(cartItemMap));
                }
            }
        );
    })
}


export async function getFromCart(userId: number) {
    // gets cart items from orders table and returns a CartItem array or a number

    return new Promise<Array<CartItem> | number>( async (resolve, reject) => {
        // promise wrapping the mysql query
        const cartItemsArr: Array<CartItem> = [];
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();

        let cart: Array<any> = await getOrdersFromUserId(myConnection, userId, 2);
        if(cart.length === 0) {
            resolve(1);
        }

        // getting item from row[i].item_id and extending the result by row[i].count
        let i = 0;
        for(i = 0; i < cart.length; i ++) {
            cartItemsArr.push(await getCartItemFromId(myConnection, cart[i]))
        }
        myConnection.end();
        resolve(cartItemsArr);
    })
}

export async function addListedItemToOrder(userId: number, itemId: number) {
    // insert the given username, items and count into the orders table

    return new Promise<number>(async (resolve, reject) => {
        let exitCode = 0;
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
        INSERT INTO
        orders (order_id, user_id, item_id, status, listed_at)
        VALUES (
            ${encodeUuidToNumber(uuidv4())},
            ${userId},
            ${itemId},
            0,
            '${jsDateToMysql(new Date())}'
        );
        `, (err, rows, fields) => {
            if(err) {
                console.log(err);
                exitCode = 1;
            }
        });
        myConnection.end();
        resolve(exitCode);
    })
}
