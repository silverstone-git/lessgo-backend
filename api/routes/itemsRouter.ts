import * as express from 'express';
import isAuthed from './authorizer';
import { Item } from './models';
import * as itemsRepo from './items_repository';

const router = express.Router();

router.post('/get-items', async (req: any, res: any) => {
	// gets you the items from the database
	//data = MongoDBClient(process.env.MONGO_URI).collection("items").all();
	//return data;

	let jwtVerify = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.json({"succ": false, "message": "Forbidden"});
		return;
	}

	let itemsOrAreThey: Array<Item> | number = await itemsRepo.get();

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
		let jsonArr: Array<any> = [];
		let i: number = 0;
		for(i = 0; i < itemsOrAreThey.length; i ++) {
			//
			jsonArr.push(Item.toMap(itemsOrAreThey[i]));
			jsonArr[i].image = "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg";
		}
		res.status(200).json({
			"succ": true,
			"itemList": jsonArr,
		})
	}

	//
	// TODO: Dates arent being parsed from MySQL properly to javascript format
	//
});

router.post('/add-item', async (req: any, res: any) => {

	let jwtVerify = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.json({"succ": false, "message": "Forbidden"});
		return;
	}

	let exitCode = await itemsRepo.post(req.body["item"]);
	if(exitCode === 1) {
		//
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
	} else if(exitCode === 0) {
		res.status(201).json({
			"succ": true,
		})
	} else {
		res.status(400).json({
			"succ": false,
			"message": "Unhandled Exception",
		})
	}
});

export default router;
