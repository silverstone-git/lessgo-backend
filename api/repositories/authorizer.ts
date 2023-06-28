import jwt from 'jsonwebtoken';
import jwt_decode from 'jwt-decode';
import * as authRepo from '../repositories/auth_repository';
const jwtSecret: string = process.env.JWT_SECRET == undefined ? '' : process.env.JWT_SECRET;
var _ = require('lodash');

// checks if user is authorized or not

function isAuthed(auth: any): Object {
	let resultToken: Object = {};
    let decodedJwt : any
    try{
        decodedJwt = jwt_decode(auth);
    } catch(e) {
        // console.log("decoding token failed!")
        console.log(e);
    }
    if(_.has(decodedJwt, 'aud')) {
        // give a request to google to find out whether the jwt is valid
        // maybe by querying the email
        // and set resultToken with the usual fields accordingl
        // for now, aud check will do
        // console.log("things are pretty googged up innit");
        if(decodedJwt.aud === process.env.GOAUTH_CLID) {
            resultToken = {
                name: decodedJwt.name,
                userId: authRepo.encodeUuidToNumber(decodedJwt.email),
                isVendor: false,
                dp: decodedJwt.picture,
            }
        }
    }
    else if(auth != undefined && auth.split(' ')[0] === 'Bearer') {
        // console.log("not googged today are we");
        try{
            resultToken = jwt.verify(auth.split(' ')[1], jwtSecret);
        } catch(e) {
            console.log(e);
        }

    }
    return resultToken;
}

export default isAuthed;
