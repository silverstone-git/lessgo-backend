import * as express from 'express';

const router = express.Router();

router.post('/', (req: any, res: any) => {
	// gets you the items from the database
	//data = MongoDBClient(process.env.MONGO_URI).collection("items").all();
	//return data;
	res.json({"itemList": [
		{"name": "scooter", "price": 80, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"name": "e-bike", "price": 10, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"name": "scooter", "price": 70, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"name": "submarine", "price": 30, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"name": "jet plane", "price": 800, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"name": "passenger plane", "price": 600, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
		{"name": "truck", "price": 20, "image": "https://upload.wikimedia.org/wikipedia/commons/0/05/Kawasaki_ZX-RR_2007TMS.jpg"},
	]});
});

export default router;
