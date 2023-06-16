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
	} else if (jwtVerify.isVendor){
        res.status(403).json({"succ": false, "message": "Please login as a Customer"});
		return;
    }

    let itemsOrAreThey: Array<CartItem> | number = await ordersRepo.getFromCart(jwtVerify.userId);

    // 1 => empty result

    if(typeof itemsOrAreThey === 'number') {
        // this is an error code, not a cart item array
        if(itemsOrAreThey === 1) {
            res.status(400).json({"succ": false, "message": "Please go to Items tab to add some items"});
        } else {
            res.status(400).json({"succ": false, "message": "Some Error Occured while fetching Cart Items"});
        }
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

	// 1 -> insertion error
	// 2 -> updation error
	// 3 -> unhandled
	let exitCode = 3;
	if(req.body["cart"]) {
		exitCode = await ordersRepo.addToCart(jwtVerify.userId, req.body["cart"]);
	}

	if(exitCode === 0) {
		res.status(201).json({"succ": true});
	} else if(exitCode === 1) {
		res.status(201).json({"succ": false, message: "Error in adding to cart"});
	} else if(exitCode === 2) {
		res.status(201).json({"succ": false, message: "Error in updating the cart"});
	} else {
		res.status(400).json({"succ": false, message: "Unhandled Exception"});
	}
})


router.post('/delete-from-cart', async (req: any, res: any) => {
	// place an order by authorizing from auth and cart in body

	let jwtVerify: any = isAuthed(req.body["Authorization"]);
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

	let exitCode = await ordersRepo.deleteFromOrders(jwtVerify.userId, Number(req.body["id"]));
	if(exitCode === 0) {
		res.status(201).json({"succ": true});
	} else {
		res.status(400).json({"succ": false, message: "Unhandled Exception"});
	}
})


export default router;