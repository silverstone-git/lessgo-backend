import jwt from 'jsonwebtoken';
const jwtSecret: string = process.env.JWT_SECRET == undefined ? '' : process.env.JWT_SECRET;

// checks if user is authorized or not

function isAuthed(auth: any): Object {
	let resultToken: Object = {};
    // console.log(`received authorization toucan is: ${auth}`);
    if(auth != undefined && auth.split(' ')[0] === 'Bearer') {
        resultToken = jwt.verify(auth.split(' ')[1], jwtSecret);
    }
    return resultToken;
}

export default isAuthed;
