import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import * as authRepo from '../repositories/auth_repository';
const jwtSecret: string = process.env.JWT_SECRET == undefined ? '' : process.env.JWT_SECRET;
var _ = require('lodash');

// checks if user is authorized or not

function isAuthed(auth: any): Object {
	let resultToken: Object = {};
    const decodedJwt : any = jwt_decode(auth);
    if(_.has(decodedJwt, 'aud')) {
        // give a request to google to find out whether the jwt is valid
        // and set resultToken with the usual fields accordingl
        // for now..
        if(decodedJwt.aud === process.env.GOAUTH_CLID) {
            resultToken = {
                name: decodedJwt.name,
                userId: authRepo.encodeUuidToNumber(decodedJwt.email),
                isVendor: false,
            }
        }
    }
    else if(auth != undefined && auth.split(' ')[0] === 'Bearer') {
        resultToken = jwt.verify(auth.split(' ')[1], jwtSecret);
    }
    return resultToken;
}

export default isAuthed;
