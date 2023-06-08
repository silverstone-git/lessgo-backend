import * as express from 'express';
import isAuthed from './authorizer';
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

	const receivedItem = req.body["item"];
	// receivedItem.image = new Blob([receivedItem.image], {type: "image/*"});
	// receivedItem.video = new Blob([receivedItem.video], {type: "video/*"});

	
	let exitCode = await itemsRepo.post(receivedItem);
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

router.post('/add-to-cart', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	// const cart: Map<string, any> = new Map(Object.entries(req.body["cart"]));

	let exitCode = await itemsRepo.addToCart(jwtVerify.userId, req.body["cart"]);
	if(exitCode === 0) {
		res.status(201).json({"succ": true});
	} else {
		res.status(400).json({"succ": false, message: "Unhandled Exception"});
	}
})

export default router;
