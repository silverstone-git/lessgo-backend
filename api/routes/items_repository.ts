import { Category, Item } from "./models";
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
    return Number(numString);
}



export async function post(item: Item) {
    //add a post
    return new Promise<number>(async (resolve, reject) => {
        let exitCode: number = encodeUuidToNumber(uuidv4());
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
        INSERT INTO
        items
        VALUES (
            ${exitCode},
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
                exitCode = 1;
            }
        });
        myConnection.end();
        resolve(exitCode);
    })
}

export async function get() {
    return new Promise<Array<any> | number>( async (resolve, reject) => {
        //

        const itemsArr: Array<any> = [];
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
        SELECT * FROM items;
        `, (err, rows, fields) => {
            //
            if(err) {
                console.log(err);
                resolve(1);
            }
            if(rows[0]) {
                let i: number = 0;
                for(i = 0; i < rows.length; i ++) {
                    // rows is nothing but an array of maps
                    itemsArr.push(rows[i] as Object);
                }
                resolve(itemsArr);
            } else {
                resolve(2);
            }
        });
        myConnection.end();
    })
}



export async function getOne(myConnection: Connection, itemId: number, returnObj: boolean = false) {

    return new Promise<Item | Object>((resolve, reject) => {
        myConnection.query(`
            SELECT * FROM items WHERE item_id = ${itemId};
            `, (err, rows, fields) => {
                //
                if(rows[0]) {
                    if(returnObj) {
                        resolve(rows[0] as Object);
                    } else {
                        resolve(Item.fromMap(rows[0]));
                    }
                }
                else {
                    if(err)
                        console.log(err);
                    if(returnObj) {
                        resolve({});
                    } else {
                        resolve(new Item('', '', Category.elec, false, 0, new Date(), '', '', undefined));
                    }
                }
            }
        );
    })

}

export async function getOneForce(itemId: number) {

    return new Promise<Object | number>( async (resolve, reject) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
            SELECT * FROM items WHERE item_id = ${itemId};
            `, (err, rows, fields) => {
                //
                if(err) {
                    console.log(err);
                    resolve(1)
                }
                if(rows[0]) {
                    resolve(rows[0] as Object);
                } else {
                    resolve(2)
                }
            }
        );
        myConnection.end();
    })

}

export async function deleteItem(itemId: any) {

    return new Promise<number>( async (resolve, reject) => {
        const myConnection = await connection(mysqlDBName);
        myConnection.connect();
        myConnection.query(`
            DELETE FROM items WHERE item_id = ${itemId};
            `, (err, rows, fields) => {
                //
                if(err) {
                    console.log(err);
                    resolve(1);
                } else {
                    resolve(0);
                }
            }
        );
        myConnection.end();
    })
}

export function carouselByCategory(category: string) {
    return new Promise<Array<Object>>(async (resolve, reject) => {
        let categories = Category;
        let storedCategory: keyof typeof categories;
        function handleErr(err: any) {
            console.log(err);
            resolve([]);
        }
        for(storedCategory in categories) {
            if(category === storedCategory) {
                const myConnection = await connection(mysqlDBName);
                myConnection.connect();
                myConnection.query(`SELECT image, item_name, item_id FROM items WHERE category = '${categories[storedCategory]}' LIMIT 5; `, (err,rows) => err? handleErr(err): resolve(rows));
                myConnection.end();
            }
        }
    })
}