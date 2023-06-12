import * as express from 'express';
import isAuthed from './authorizer';
import * as itemsRepo from './items_repository';
import { Item } from './models';
import * as ordersRepo from './orders_repository';

const router = express.Router();


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

export default router;
