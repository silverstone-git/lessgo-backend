import * as express from 'express';
import isAuthed from '../repositories/authorizer';
import * as itemsRepo from '../repositories/items_repository';
import { Item } from '../models/models';
import * as ordersRepo from '../repositories/orders_repository';

const router = express.Router();


router.get('/get-item/:id', async (req: any, res: any) => {
	// gets you the items from the database

	let passedId = req.params['id'];
	let itemOrIsIt: any | number = 1;
	passedId = Number(passedId);
	let loggedIn = false;
	if(!Number.isNaN(passedId)) {
		// also, check if jwtToken is passed to this function and count++ the hits in item if verified
		const authHeader = req.header('authorization');
		let jwtVerify: any = isAuthed(authHeader);
		if(Object.keys(jwtVerify).length > 0) {
			loggedIn = true;
		}
		itemOrIsIt = await itemsRepo.getOneForce(passedId, loggedIn);
	}

	if(typeof itemOrIsIt === 'number') {
		let message: string = "Unhandled Exception";
		let statusCode:number = 400;
		if(itemOrIsIt === 1) {
			message = "An error occured while querying data";
		} else if(itemOrIsIt === 2) {
			statusCode = 404;
			message = "No such item was found";
		}
		res.status(statusCode).json({
			"succ": false,
			"message": message,
		})
	} else {
		res.status(200).json({
			"succ": true,
			"itemObjStr": JSON.stringify(itemOrIsIt),
		})
	}

	//
	// TODO: Dates arent being parsed from MySQL properly to javascript format
	//
});


router.post('/get-items', async (req: any, res: any) => {
	// gets you the items from the database

	let jwtVerify = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	let itemsOrAreThey: Array<any> | number = await itemsRepo.get();

	if(typeof itemsOrAreThey === 'number') {
		let message: string = "Unhandled Exception";
		let statusCode:number = 400;
		if(itemsOrAreThey === 1) {
			message = "An error occured while querying data";
		} else if(itemsOrAreThey === 2) {
			statusCode = 404;
			message = "No Items were found";
		}
		res.status(statusCode).json({
			"succ": false,
			"message": message,
		})
	} else {
		let i: number = 0;
		res.status(200).json({
			"succ": true,
			"itemList": JSON.stringify(itemsOrAreThey),
		})
	}

	//
	// TODO: Dates arent being parsed from MySQL properly to javascript format
	//
});

router.post('/add-item', async (req: any, res: any) => {

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	let receivedItem = req.body["item"];

	receivedItem = Item.fromMap(receivedItem);

	// exit code is the newly created item id if things succeed, 1 or 2 if not
	let exitCode = await itemsRepo.post(receivedItem);
	if(exitCode === 1) {
		res.status(400).json({
			"succ": false,
			"message": "Invalid Input",
		})
	} else if(exitCode === 2) {
		//
		res.status(404).json({
			"succ": false,
			"message": "Network Error",
		})
	} else {
		let exitCode2 = await ordersRepo.addListedItemToOrder(jwtVerify.userId, exitCode);
		if(exitCode2 === 0) {
			res.status(201).json({
				"succ": true,
			})
		} else {
			res.status(400).json({
				"succ": false,
				"message": "Failed to add item for the seller account",
			})
		}
	}
});

router.post('/listed', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0 || !jwtVerify.isVendor) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	// const cart: Map<string, any> = new Map(Object.entries(req.body["cart"]));

	let arrayOfItems:Array<Object> | number = await ordersRepo.getListedItems(jwtVerify.userId);
	if(typeof arrayOfItems === 'number') {
		// handle the error codes here
		if(arrayOfItems === 2) {
			res.status(404).json({"succ": false});
		} else if(arrayOfItems === 1) {
			res.status(500).json({"succ": false, message: "Server Error"});
		} else {
			res.status(400).json({"succ": false, message: "Unhandled Exception"});
		}
	} else {
		res.status(200).json({"succ": true, "itemsObjectList": JSON.stringify(arrayOfItems)});
	}
})

router.post('/delete-listing', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0 || !jwtVerify.isVendor) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	let exitCode = await itemsRepo.deleteItem(req.body["itemId"]);
	if(exitCode === 0) {
		res.status(201).json({"succ": true});
	} else {
		res.status(400).json({"succ": false, message: "Error occurred while deleting"});
	}
})

router.post('/category', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	let arrayOfRowObjects: Array<any> = await itemsRepo.carouselByCategory(req.body["category"]);
	if(arrayOfRowObjects.length === 0) {
		res.status(400).json({"succ": false, message: "Error occurred while deleting"});
	} else {
		const arrayOfArraysOfProps : Array<Array<string>> = [];
		arrayOfRowObjects.forEach((val) => {
			arrayOfArraysOfProps.push([val.image, val.item_name, val.item_id.toString()]);
		})
		// console.log("result after mappings -> ", arrayOfArraysOfProps);
		res.status(201).json({"succ": true, "carouselArray": JSON.stringify(arrayOfArraysOfProps)});
	}
})

router.get('/get-hot-items', async (req, res) => {
	const result: Array<any> = await itemsRepo.getHotItems();
	if(result.length > 0) {
		const arrayOfArraysOfProps : Array<Array<string>> = [];
		result.forEach((val) => {
			arrayOfArraysOfProps.push([val.image, val.item_name, val.item_id.toString()]);
		})
		// console.log("result after mappings -> ", arrayOfArraysOfProps);
		res.status(200).json({"succ": true, "carouselArray": JSON.stringify(arrayOfArraysOfProps)});
	} else {
		res.status(403).json({"succ": false, "carouselArray": JSON.stringify([])});
	}
})

export default router;
