
import mysql, { Connection } from 'mysql';

import { v4 as uuidv4 } from 'uuid';
import { CartItem, Item } from './models';
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


export async function deleteFromOrders(userId: string, id: number) {
    // insert the given username, items and count into the orders table

    return new Promise<number>(async (resolve, reject) => {
        let exitCode = 0;
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
        DELETE FROM
        orders
        WHERE
        order_id = ${id};
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


async function getOrdersFromUserId(myConnection: Connection, userId: number, statusCode: number, sendItemIdsOnly = false) {
    //
    return new Promise<Array<any>>(async (resolve, reject) => {
        const cart: Array<any> = [];
        myConnection.query(`
        SELECT item_id, count, cart_at, order_id FROM orders WHERE user_id = ${userId} AND status = ${statusCode};
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
                    if(sendItemIdsOnly) {
                        cart.push(Number(rows[i].item_id))
                    } else {
                        cart.push(rows[i] as Object);
                    }
                }
                resolve(cart)
            } else {
                // console.log("no hits for such order");
                resolve([]);
            }
        });
    })
}

/*
async function getOrdersFromUserIdNewConnection(userId: number, statusCode: number) {

    const myConnection = await connection(mysqlDBName);
    myConnection.connect();
    return (await getOrdersFromUserId(myConnection, userId, statusCode));
    
}
*/




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
                    //
                    //
                    // CHANGE THIS LINE IF MODEL CHANGES
                    //
                    //
                    // console.log("order object being passed to getting item from itemid is: ");
                    let cartItemMap = {...rows[0], "count": cartObj.count, "cart_at": cartObj.cart_at, "order_id": cartObj.order_id};
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

async function resetFkChecks(myConnection: Connection): Promise<void> {
    return new Promise<void>((resolve) => {
        myConnection.query('SET foreign_key_checks = 0;');
        resolve();
    })
}
async function setFkChecks(myConnection: Connection): Promise<void> {
    return new Promise<void>((resolve) => {
        myConnection.query('SET foreign_key_checks = 1;');
        resolve();
    })
}

export async function addListedItemToOrder(userId: number, itemId: number) {
    // insert the given username, items and count into the orders table

    return new Promise<number>(async (resolve, reject) => {
        let exitCode = 0;
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        // reset fk checks because the new item id isnt reflected in just the next query
        await resetFkChecks(myConnection);
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
        // set fk checks because, safety
        await setFkChecks(myConnection);
        myConnection.end();
        resolve(exitCode);
    })
}

export async function getListedItems(userId: number) {
    return new Promise<Array<Object> | number>( async (resolve, reject) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        
        // getting an array of item ids from orders table
        const listedItemsIds: Array<number> = await getOrdersFromUserId(myConnection, userId, 0, true);
        if(listedItemsIds.length == 0) {
            resolve(2);
            return;
        }
        const itemsObjects: Array<Object> = [];

        for(var i = 0; i < listedItemsIds.length; i ++) {
            // let itemObj = await itemsRepo.getOne(myConnection, listedOrders[i].item_id, true);
            // itemObj = {...itemObj, "order_id": listedOrders[i].order_id}
            let itemObj = await itemsRepo.getOne(myConnection, listedItemsIds[i], true);
            itemsObjects.push(itemObj);
        }


        myConnection.end();
        resolve(itemsObjects);

    })
}