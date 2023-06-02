export class User {
    username: string;
    email: string;
    password: string;
    lastLogin: Date | undefined;
    joinedDt: Date | undefined;

    public constructor(username: string, email: string, password: string, lastLogin: Date | undefined = undefined, joinedDt: Date | undefined = undefined) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.lastLogin = lastLogin;
        this.joinedDt = joinedDt;
    }

    public static fromMap(map: any) {
        // returns a user instance
        return new User(map.username, map.email, map.password, map.lastLogin, map.joinedDt);
    }
}


export class Item {
    itemName: string;
    description: string;
    category: string;
    inStock: boolean;
    priceRs: number;
    dateAdded: Date;

    public constructor(itemName: string, description: string, category: string, inStock: boolean, priceRs: number, dateAdded: Date) {
        this.itemName = itemName;
        this.description = description;
        this.category = category;
        this.inStock = inStock;
        this.priceRs = priceRs;
        this.dateAdded = dateAdded;
    }
}