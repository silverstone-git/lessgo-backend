
// checks if user is authorized or not

function isAuthed(auth: any): boolean {
    //
	let result = false;
    console.log(`received authorization toucan is: ${auth}`);
    if(auth != undefined && (auth.split(' ').length == 2 || auth.split(' ')[1] === 'breh')) {
        result = true;
    }
    return result;
}

export default isAuthed;
