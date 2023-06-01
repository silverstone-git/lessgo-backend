import * as authRepo from './auth_repository'

const checkValid = async (body: any) =>  {

	// validate the req.body fields if empty or wierd characters
    // validArray is 1,1,1 in ideal case indicating valid username, email, and password respectively
    // exactly what is wrong with those inputs are encoded within the integer returned instead of 1
	
	const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	const validArray: Array<number> = [];
    let i: number;


	// alphanumeric check
	let notAlphaNumeric = false;
	let curCode;
	for(i = 0; i < body.username.length; i ++) {
		curCode = body.username.charCodeAt(i);
		if( (curCode < 40) || (curCode > 57 && curCode < 65) || (curCode > 90 && curCode < 97) || (curCode > 122) ) {
			notAlphaNumeric = true;
		}
	}


	let newUser = 1;
    // 0th index indicates whether username is right or not
	if(body.username.length < 4) {
        validArray.push(0);
    } else if(notAlphaNumeric) {
		validArray.push(-1);
	} else {
		// if username is alpha numeric and length is big enough, proceed to check if username already exists
        const user = await authRepo.findUser(body.username);
        if(user) {
            // case when username already exists
            newUser = -2;
        }
        validArray.push(newUser)
    }


    // 1st index indicates whether email is right or not
	if(body.email.match(mailformat)) {
		// email is valid
		validArray.push(1);
	} else {
		validArray.push(0);
	}

    // 2nd index indicates whether password is short or not
	body.password.length < 8 ? validArray.push(0) : validArray.push(1);

	console.log(`Valid array in validation ts is: ${validArray}`);

	return validArray;

}


export default checkValid;