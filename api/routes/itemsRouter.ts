import * as express from 'express';

const router = express.Router();

router.post('/', (req: any, res: any) => {
	// gets you the items from the database
	//data = MongoDBClient(process.env.MONGO_URI).collection("items").all();
	//return data;
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

export default router;
