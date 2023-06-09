import * as express from 'express';
import isAuthed from './authorizer';
import * as ordersRepo from './orders_repository';
import { CartItem } from './models';
const router = express.Router();

router.post("/cart", async (req, res) => {
    // get items from the user's cart

    // get user's auth from body, verify it, then search orders for that id
	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
        console.log("403");
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

    let itemsOrAreThey: number | Array<CartItem> = await ordersRepo.getFromCart(jwtVerify.userId);

    // 1 => error
    // 2 => empty result
    // 3 => error in querying item from item id in order
    // 4 => no item exists for such item id in order (sorta impossible)

    if(typeof itemsOrAreThey === 'number') {
        // this is an error code, not a cart item array
        res.status(400).json({"succ": false, "message": "Some Error Occured while fetching Cart Items"});
    } else {
        const cartItemObjArr: any[] = [];
        for(var i = 0; i < itemsOrAreThey.length; i ++) {
            cartItemObjArr.push(CartItem.toMap(itemsOrAreThey[i]));
        }
        res.status(200).json({
            "succ": true,
            "itemsObjectList": cartItemObjArr,
        })
    }


})

router.post('/add-to-cart', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	// const cart: Map<string, any> = new Map(Object.entries(req.body["cart"]));

	let exitCode = await ordersRepo.addToCart(jwtVerify.userId, req.body["cart"]);
	if(exitCode === 0) {
		res.status(201).json({"succ": true});
	} else {
		res.status(400).json({"succ": false, message: "Unhandled Exception"});
	}
})

export default router;