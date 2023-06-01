
import argon2 from 'argon2';


export async function findUser(username: String) {
    // finding the user by username
    console.log(`user with username ${username} is being searched`);
    return {'email': '', found: false};
}


export async function updateLastLoggedIn(username: String, date: Date) {
    // parse from string and then put the date back into mysql formatted string
    return {'succ': true};
}

export async function createUser(username: String, email: String, password: String) {
    // finding the user by username
    console.log(`user being created -> ${username}, ${email}, with password ${await argon2.hash(password as string)}`);
    return {'succ': true, 'message': "User has been successfully created, please proceed to Login"};
}