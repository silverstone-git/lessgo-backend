import * as authRepo from './auth_repository'

const checkValid = async (body: any) =>  {

	// validate the req.body fields if empty or wierd characters
    // validArray is 1,1,1 in ideal case indicating valid username, email, and password respectively
    // exactly what is wrong with those inputs are encoded within the integer returned instead of 1
	
	const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	const validArray: Array<number> = [];

	let usernameIsAlphabetsAndSpaces = /^[a-zA-Z\s]*$/.test(body.username);


	// skipping exist chack and shifting this burden on the main create account function
	// let newUser = 1;
    // 0th index indicates whether username is right or not
	if(body.username.length < 3) {
        validArray.push(0);
    } else if(!usernameIsAlphabetsAndSpaces) {
		validArray.push(-1);
	} else {
		// if username is alpha numeric and length is big enough, proceed to check if username already exists
		/*
        const found = await authRepo.getUserByEmail(body.email);
        if(found.username != "") {
            // case when username already exists
            newUser = -2;
        }
        validArray.push(newUser)
		*/
        validArray.push(1)
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

	// 3rd index indicates whether password and confirm password are equal or not
	body.password === body.password2 ? validArray.push(1) : validArray.push(0);

	return validArray;

}


export default checkValid;