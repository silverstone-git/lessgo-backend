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
		//
		// TODO: render the entered image in view instead of this stub loop
		//
		for(i = 0; i < itemsOrAreThey.length; i ++) {
			itemsOrAreThey[i].image = "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg";
		}
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

	let jwtVerify = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
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

router.post('/place-order', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	// const cart: Map<string, any> = new Map(Object.entries(req.body["cart"]));

	let exitCode = itemsRepo.order(jwtVerify.name, req.body["cart"]);
	res.status(201).json({"succ": true});
})

export default router;
