
import { User, Item } from './models';
import argon2 from 'argon2';


export async function findUser(username: string) {
    // finding the user by username
    const found = false;
    console.log(`user with username ${username} is being searched`);
    username = "";
    const email = "";
    const password = "";
    const user: User = new User(username, email, password, );
    if(found) {
        return user;
    }
    return found;
}


export async function updateLastLoggedIn(username: string, date: Date) {
    // parse from string and then put the date back into mysql formatted string
    return {'succ': true};
}

export async function createUser(user: User) {
    // finding the user by username
    console.log(`user being created -> ${user.username}, ${user.email}, with password ${user.password}`);
    return {'succ': true, 'message': "User has been successfully created, please proceed to Login"};
}

export async function verifyPassword(hashedPassword: string, password: string) {
    return await argon2.verify(hashedPassword, password);
}

export async function hashedPassword(password: string) {
    return await argon2.hash(password);
}