
import mysql, { Connection } from 'mysql';

import { v4 as uuidv4 } from 'uuid';
import { CartItem, Item } from '../models/models';
import * as itemsRepo from './items_repository';
import { getUserAddress } from './auth_repository';
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


function encodeUuidToNumber(myUuid: string) {
    let i: number;
    let numString = "";
    for(i = 0; i < myUuid.length; i ++) {
        numString += myUuid[i].charCodeAt(0).toString();
    }
    numString = numString.substring(0, 9);
    return numString;
}

async function existsInCart(userId: string, itemId: string, myConnection: Connection) {
    return new Promise<boolean>((resolve, reject) => {
        myConnection.query(`SELECT COUNT(order_id) AS cart_occurences FROM orders WHERE item_id = ${itemId} and user_id = ${userId} and status = 2;`, (err, rows, fields) => {
            if(err) {
                console.log(err);
                resolve(false);
            } else {
                if(rows[0].cart_occurences != 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}


export async function existsInCartForce(userId: string, itemId: string) {
    return new Promise<boolean>(async (resolve, reject) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        resolve(await existsInCart(userId, itemId, myConnection));
    });
}

function insertIntoCart(userId: string, itemId: string, count: number, myConnection: Connection, dateAdded: Date) {
    return new Promise<number>((resolve, reject) => {
        myConnection.query(`
        INSERT INTO
        orders (order_id, user_id, item_id, status, count, cart_at, listed_at)
        VALUES (
            ${encodeUuidToNumber(uuidv4())},
            ${userId},
            ${itemId},
            2,
            ${count},
            '${jsDateToMysql(new Date())}',
            '${jsDateToMysql(dateAdded)}'
        );
        `, (err, rows, fields) => {
            if(err) {
                console.log(err);
                resolve(1);
            } else {
                resolve(0);
            }
        });
    })
}

function updateCartCount(userId: string, itemId: string, count: number, myConnection: Connection) {
    return new Promise<number>((resolve, reject) => {
        myConnection.query(`
        UPDATE orders SET count = count + ${count} where user_id = ${userId} and item_id = ${itemId} and status = 2;
        `, (err, rows, fields) => {
            if(err) {
                console.log(err);
                resolve(2);
            } else {
                resolve(0);
            }
        });
    })
}


export async function addToCart(userId: string, cart: Object) {
    // insert the given username, items and count into the orders table

    return new Promise<number>(async (resolve, reject) => {
        let exitCode = 3;
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        for(const [itemId, count] of Object.entries(cart)) {
            // get the id from cart entry, check table for existing cart item,
            // if exists, increment count, else, add new row
            if(await existsInCart(userId, itemId, myConnection)) {
                exitCode = await updateCartCount(userId, itemId, count, myConnection);
            } else {
                const dateAddedString: string = await itemsRepo.getDateAddedString(myConnection, Number(itemId));
                exitCode = await insertIntoCart(userId, itemId, count, myConnection, new Date(Number(dateAddedString)));
            }
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


async function getOrdersFromUserId(myConnection: Connection, userId: number | undefined = undefined, statusCode: number, sendItemIdsOnly = false, itemId: number | undefined = undefined) {
    return new Promise<Array<any>>(async (resolve, reject) => {
        const cart: Array<any> = [];
        const queryStr = `
        SELECT * FROM orders WHERE ${userId ? "user_id = " + userId + " AND " : ""} ${itemId ? "item_id = " + itemId + " AND " : ""} status = ${statusCode};
        `
        myConnection.query(queryStr, (err, rows, fields) => {
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


async function getCartItemFromId(myConnection: Connection, cartObj: any, getImage : boolean = true, getVideo: boolean = false, getObj: boolean = false) {
    return new Promise<any>((resolve, reject) => {
        myConnection.query(`
            SELECT item_id, item_name, description, category, in_stock, in_stock, price_rs, date_added, hits ${getImage ? " ,image " : ""} ${getVideo ? ",video ": ""} FROM items WHERE item_id = ${cartObj.item_id};
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
                    let cartItemMap = {...rows[0], "count": cartObj.count, "cart_at": cartObj.cart_at, "order_id": cartObj.order_id, "received_at": cartObj.received_at};
                    if(getObj)
                        resolve(cartItemMap);
                    else
                        resolve(CartItem.fromMap(cartItemMap));
                } else {
                    if(getObj)
                        resolve({});
                    else
                        resolve(CartItem.johnDoe());
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
            cartItemsArr.push(await getCartItemFromId(myConnection, cart[i], true))
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


export async function getListedItemsSub(myConnection: Connection, userId : number, sendItemIdsOnly: boolean = false) {
    return new Promise<Array<any>>(async (res, rej) => {

        // getting an array of item ids from orders table
        const listedItemsIds: Array<number> = await getOrdersFromUserId(myConnection, userId, 0, true);

        if(listedItemsIds.length == 0) {
            res([]);
            return;
        }
        if(sendItemIdsOnly) {
            res(listedItemsIds);
            return;
        }

        const itemsObjects: Array<Object> = [];

        for(var i = 0; i < listedItemsIds.length; i ++) {
            let itemObj: any = await itemsRepo.getOne(myConnection, listedItemsIds[i], true);
            itemsObjects.push(itemObj);
        }
        res(itemsObjects);
    })
}

export async function getListedItems(userId: number) {
    return new Promise<Array<Object> | number>( async (resolve, reject) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        const listedItems = await getListedItemsSub(myConnection, userId, false)
        
        myConnection.end();
        resolve(listedItems);

    })
}


async function placeOrderFromId(myConnection: Connection, userId: number, address: string) {
    return new Promise<number>(async (res, rej) => {
        myConnection.query(`UPDATE orders SET status = 3, address = '${address}', placed_at = '${jsDateToMysql(new Date())}' WHERE user_id = ${userId} and status = 2`, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res(1);
            } else {
                res(0);
            }
        });
    })
}


async function addAddressToUser(myConnection: Connection, userId: number, address: string) {
    return new Promise<number>((res, rej) => {
        const queryStr = `UPDATE users SET address = '${address}' WHERE user_id = ${userId};`;
        myConnection.query(queryStr, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res(1)
            } else {
                res(0);
            }
        })
    })
}


export async function placeOrder(userId: number, address: string) {
    return new Promise<number>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        let exit = 1;
        if(!address || address === 'undefined') {
            const defaultAddress = await getUserAddress(myConnection, userId);
            exit = await placeOrderFromId(myConnection, userId, defaultAddress);
        } else {
            await addAddressToUser(myConnection, userId, address);
            exit = await placeOrderFromId(myConnection, userId, address);
        }
        myConnection.end();
        res(exit);
    })
}

export function getOrders(userId: number) {
    // returns a promise of array of cart items
    return new Promise<Array<any>>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        const cartItemsArr: Array<any> = [];
        let cart: Array<any> = await getOrdersFromUserId(myConnection, userId, 3);
        if(cart.length === 0) {
            res([]);
            myConnection.end();
            return;
        }

        // getting item from row[i].item_id and extending the result by row[i].count
        let i = 0;
        for(i = 0; i < cart.length; i ++) {
            cartItemsArr.push(await getCartItemFromId(myConnection, cart[i], true, false, true));
        }
        res(cartItemsArr);
        myConnection.end();
    })
}


export async function isOrdered(itemId: string, userId: number) {
    return new Promise<boolean | Error>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        function handleErr(err: any) {
            console.log(err);
            res(Error("Mysql Error Occured"));
        }
        myConnection.connect();
        myConnection.query(`SELECT * FROM orders WHERE item_id = ${itemId} AND status = 3 AND user_id = ${userId} and received_at IS NOT NULL;`, (err,rows) => err? handleErr(err): res(rows[0] ? true : false));
        myConnection.end();
    })
}


export async function getVendorOrders(userId: number) {
    return new Promise<Array<CartItem>>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        const ordersArr: Array<any> = [];
        let listedItemIds: Array<number> = await getListedItemsSub(myConnection, userId, true);
        if(listedItemIds.length === 0) {
            res([]);
            myConnection.end();
            return;
        }


        let i = 0;
        for(i = 0; i < listedItemIds.length; i ++) {
            ordersArr.push(...(await getOrdersFromUserId(myConnection, undefined, 3, false, listedItemIds[i])));
        }

        const compositeItemOrderArr: Array<any> = [];
        let el: any;
        for(i = 0; i < ordersArr.length; i ++) {
            el = ordersArr[i];
            const cartItem = await getCartItemFromId(myConnection, {item_id: el.item_id, cart_at: el.cart_at, count: el.count, order_id: el.order_id}, true, false, true);
            const composite = Object.assign(el, cartItem);
            compositeItemOrderArr.push(composite);
        }
        myConnection.end();
        res(compositeItemOrderArr);
    });
}



export async function receivedPayment(orderId: number) {
    return new Promise<number>(async (res, rej) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`UPDATE orders set received_at = '${jsDateToMysql(new Date())}' WHERE order_id = ${orderId};`, (err, rows, fields) => {
            if(err) {
                console.log(err);
                res(1);
            } else {
                res(0);
            }
        });
        myConnection.end();
    });
}