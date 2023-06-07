import * as express from 'express';
import isAuthed from './authorizer';
import { Item } from './models';
import * as itemsRepo from './items_repository';

const router = express.Router();

router.post('/get-items', (req: any, res: any) => {
	// gets you the items from the database
	//data = MongoDBClient(process.env.MONGO_URI).collection("items").all();
	//return data;
	console.log("returning items....")
	res.json({"itemList": [
		{"itemName": "scooter", "description": "", "category": "", inStock: true, "priceRs": 80, "dateAdded": new Date('August 14, 2003'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"itemName": "e-bike", "description": "", "category": "", inStock: true, "priceRs": 10, "dateAdded": new Date('August 14, 2003'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"itemName": "scooter", "description": "", "category": "", inStock: true, "priceRs": 70, "dateAdded": new Date('August 14, 2003 11:20:00'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"itemName": "submarine", "description": "", "category": "", inStock: true, "priceRs": 30, "dateAdded": new Date('August 14, 2003'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"itemName": "jet plane", "description": "", "category": "", inStock: true, "priceRs": 800, "dateAdded": new Date('August 14, 2003'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"itemName": "passenger plane", "description": "", "category": "", inStock: true, "priceRs": 600, "dateAdded": new Date('August 14, 2003'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"itemName": "truck", "description": "", "category": "", inStock: true, "priceRs": 20, "dateAdded": new Date('August 14, 2003'), "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
	]});
});

router.post('/add-item', async (req: any, res: any) => {
	console.log("received auth is: ");
	console.log(req.body["Authorization"]);
	console.log("received item is: ");
	console.log(req.body["item"]);

	let jwtVerify = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.json({"succ": false, "message": "Forbidden"});
		return;
	}

	let exitCode = await itemsRepo.post(Item.fromMap(req.body["item"]));
	if(exitCode === 1) {
		//
		res.json({
			"succ": false,
			"message": "Invalid Input",
		})
	} else if(exitCode === 2) {
		//
		res.json({
			"succ": false,
			"message": "Network Error",
		})
	} else if(exitCode === 0) {
		//
		res.json({
			"succ": true,
		})
	} else {
		res.json({
			"succ": false,
			"message": "Unhandled Exception",
		})
	}
});

export default router;
