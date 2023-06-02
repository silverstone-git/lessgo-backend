import * as express from 'express';
import * as authRepo from './auth_repository';
import jwt from 'jsonwebtoken';
import checkValid from './validation';
import isAuthed from './authorizer';
import { User } from './models';

import 'dotenv/config';

const router = express.Router();

const jwtSecret: string = process.env.JWT_SECRET == undefined ? '' : process.env.JWT_SECRET;

router.post('/isLoggedIn', (req: any, res: any) => {
	// check if logged in given a jwt header
	// for now, lets just -

    const jwtVerify = isAuthed(req.body.Authorization);
	if(jwtVerify) {
		res.status(200);
		res.json({"isLoggedIn": true});
	} else {
		res.status(403);
		res.json({"isLoggedIn": false});
	}
});


router.post('/login', async (req: any, res: any) => {

    // take credentials from body
    // give back the jwt or a 403 with succ: false
    const username = req.body.username;
    // 1 means all good, 0 means wrong password, -1 means user not even found in database
    const toAuthenticateOrNot = await authRepo.loginUser(username, req.body.password);
    if(toAuthenticateOrNot == 1) {
            const authorization: string  = jwt.sign({name: username}, jwtSecret);
            res.status(200).json({'Authorization': `Bearer ${authorization}`, 'succ': true})
    } else if(toAuthenticateOrNot == 0) {
            res.status(403).json({'succ': false, 'message': 'wrong_password'});
    } else {
        res.status(404).json({'succ': false, 'message': 'doesnt_exist'});
    }
});

router.post('/create', async (req: any, res: any) => {
    // get the credentials using the
    const username = req.body.username;
    const email = req.body.email;

    if(isAuthed(req.body.Authorization)) {
        // if the user is authed up already, dont do this creation

        res.status(200).json({"message": "already_authorized"});
        return;
    }
    
    const validCheckRes: Array<number> = await checkValid(req.body);
    if(JSON.stringify(validCheckRes) == JSON.stringify([1,1,1])) {
        // sign the user up	
        // make the validArray[0] = -2 if connection error
        const hashedPassword = await authRepo.hashedPassword(req.body.password);
        const exitCode = await authRepo.createUser(new User(username, email, hashedPassword));
        if(exitCode == 0) {
            //
            res.status(201).json({"succ": true, "message" : "User has been successfully created, please proceed to Login"});
        }

	} else {
		// display user suggestion on correct input at frontend

		let fail = "invalid_username_or_password";
		if(validCheckRes[0] == 0) {
			fail = "Username too short";
		} else if(validCheckRes[0] == -1) {
			fail = "Please Enter Alphanumeric Username";
		} else if(validCheckRes[0] == -2) {
			fail = "Username Already Taken!";
		} else if(validCheckRes[0] == -3) {
			fail = "Connection Error";
		}else if(validCheckRes[1] == 0){
			fail = "Invalid email";
		} else if(validCheckRes[2] == 0){
			fail = "Password too short!";
		}else {
			fail = "Unhandled error while creating the account";
		}
        console.log(`fail reason : ${fail}`);
		res.status(400).json({"fail": fail, "succ": false});
        return;
	}
}) 

export default router;