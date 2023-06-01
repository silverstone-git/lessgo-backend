import * as express from 'express';
import checkValid from './validation';
import isAuthed from './authorizer';
import * as authRepo from './auth_repository';
import { User } from './models';

const router = express.Router();

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
    const user = await authRepo.findUser(username);
    if(user) {
        // the case if user exists in our database
        if(await authRepo.verifyPassword(user.password, req.body.password)) {
            // const authorization: string  = jwt.sign({name: username}, jwtSecret);
            console.log("logging in....");
            const authorization = "breh"
            await authRepo.updateLastLoggedIn(username, new Date());
            res.status(200).json({'Authorization': `Bearer ${authorization}`, 'succ': true})
        } else {
            res.status(403).json({'succ': false, 'message': 'wrong_password'});
        }
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
        const result = authRepo.createUser(new User(username, email, hashedPassword));
        res.status(201).json(result);

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