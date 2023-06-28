import * as express from 'express';
import * as authRepo from '../repositories/auth_repository';
import jwt from 'jsonwebtoken';
import checkValid from '../repositories/validation';
import isAuthed from '../repositories/authorizer';
import { User } from '../models/models';

import 'dotenv/config';

const router = express.Router();

const jwtSecret: string = process.env.JWT_SECRET == undefined ? '' : process.env.JWT_SECRET;

router.post('/isLoggedIn', (req: any, res: any) => {

    const jwtVerify: any = isAuthed(req.body.Authorization);
	if(Object.keys(jwtVerify).length > 0) {
		res.status(200);
        if(req.body.sendUsername) {
		    res.json({"isLoggedIn": true, "username": jwtVerify.name, "isVendor": jwtVerify.isVendor, dp: jwtVerify.dp});
        } else {
		    res.json({"isLoggedIn": true, "email": jwtVerify.email, "isVendor": jwtVerify.isVendor, dp: jwtVerify.dp});
        }
	} else {
		res.status(403);
		res.json({"isLoggedIn": false, "email": "", "isVendor": false});
	}
});


router.post('/login', async (req: any, res: any) => {

    // take credentials from body
    // give back the jwt or a 403 with succ: false
    const email = req.body.email;
    // 1 means all good, 0 means wrong password, -1 means user not even found in database
    const toAuthenticateOrNot = await authRepo.loginUser(email, req.body.password);
    if(toAuthenticateOrNot instanceof User) {
            const authorization: string  = jwt.sign({name: toAuthenticateOrNot.username, isVendor: toAuthenticateOrNot.isVendor, userId: toAuthenticateOrNot.userId, dp: toAuthenticateOrNot.dp}, jwtSecret);
            res.status(200).json({'Authorization': `Bearer ${authorization}`, 'succ': true})
    } else if(toAuthenticateOrNot == 0) {
            res.status(403).json({'succ': false, 'message': 'Wrong Password'});
    } else {
        res.status(404).json({'succ': false, 'message': 'The Account with such credentials doesn\'t exist'});
    }
});

router.post('/create', async (req: any, res: any) => {
    // get the credentials using the
    const username = req.body.username;
    const email = req.body.email;
    const vendorReq = req.body.vendorReq === "vendor" ? true : false;

    // console.log("received auth token in /create -> ", req.body.Authorization );

    if(!(JSON.stringify(isAuthed(req.body.Authorization)) == JSON.stringify({}))) {
        // if the user is authed up already, dont do this creation

        res.status(200).json({ "succ": false, "fail": "Already Logged In!"});
        return;
    }
    
    let validCheckRes: Array<number>;
    const oauth = req.body['auth_type'] !== 'argon';
    if(oauth) {
        validCheckRes = [1,1,1,1];
    } else {
        validCheckRes = await checkValid(req.body);
    }
    if(JSON.stringify(validCheckRes) == JSON.stringify([1,1,1,1])) {
        // sign the user up	
        // make the validArray[0] = -2 if connection error
        let hashedPassword;
        if(oauth) {
            hashedPassword = '';
        } else {
            hashedPassword = await authRepo.hashedPassword(req.body.password);
        }
        const exitCode = await authRepo.createUser(new User(username, email, hashedPassword, vendorReq, undefined, new Date(), undefined, '', req.body['auth_type'], req.body['dp']), oauth);
        if(exitCode == 0) {
            res.status(201).json({"succ": true, "message" : "User has been successfully created, please proceed to Login"});
        } else if(exitCode == -2) {
            // if Connection Error
            res.status(500).json({"succ": false, "fail": "Server Error"});
        } else if(exitCode == 409) {
            // if Connection Error
            res.status(500).json({"succ": false, "fail": "Account with this email already exists"});
        }

	} else {
		// display user suggestion on correct input at frontend

		let fail = "invalid_username_or_password";
		if(validCheckRes[0] == 0) {
			fail = "Username too short";
		} else if(validCheckRes[0] == -1) {
			fail = "Invalid Name";
		} else if(validCheckRes[0] == -3) {
			fail = "Connection Error";
		}else if(validCheckRes[1] == 0){
			fail = "Invalid email";
		} else if(validCheckRes[2] == 0){
			fail = "Password too short!";
		} else if(validCheckRes[3] == 0){
			fail = "Passwords don't match";
		}else {
			fail = "Unhandled error while creating the account";
		}
        // console.log(`fail reason : ${fail}`);
		res.status(400).json({"fail": fail, "succ": false});
        return;
	}
});

router.get("/getaddress", async (req: any, res: any) => {
	let jwtVerify: any = isAuthed(req.header("authorization"));
	if(Object.keys(jwtVerify).length === 0) {
		res.status(403).json({"succ": false, "message": "Forbidden"});
		return;
	}

    const exitString = await authRepo.getUserAddressForce(jwtVerify.userId);
    if(exitString === '') {
        res.json({succ: false, address: ""});
    } else {
        res.json({succ: true, address: exitString});
    }

})

router.post('/google-finduser', async (req, res) => {
    const exists = await authRepo.getUserByEmail(req.body['email'], false);
    if(exists.username !== '') {
        res.status(200).json({exists : true});
    } else {
        res.status(200).json({exists: false});
    }
})

export default router;