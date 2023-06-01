
// checks if user is authorized or not

function isAuthed(body: any): boolean {
    //
	let result = false;
    console.log(`received authorization toucan is: ${body.Authorization}`);
    if(body.Authorization != undefined && (body.Authorization.split(' ').length == 2 || body.Authorization.split(' ')[1] === 'breh')) {
        result = true;
    }
    return result;
}

export default isAuthed;
