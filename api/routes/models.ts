export class User {
    username: string;
    email: string;
    password: string;
    isVendor: boolean;
    lastLogin: Date | undefined;
    joinedDt: Date | undefined;

    public constructor(username: string, email: string, password: string, isVendor: boolean, lastLogin: Date | undefined = undefined, joinedDt: Date | undefined = undefined, ) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.lastLogin = lastLogin;
        this.joinedDt = joinedDt;
        this.isVendor = isVendor;
    }

    public static fromMap(map: any) {
        // returns a user instance
        return new User( map.username, map.email, map.password, map.is_vendor == 1 ? true : false, map.last_login, map.joined_dt);
    }
}


export enum Category {
    elec = "Electronic Accessories",
    mach = "Factory Machines",
    veh = "Vehicles",
    mat = "Material Components",
    fmcg = "FMCG Products",
}


export class Item {
    itemName: string;
    description: string;
    category: Category;
    inStock: boolean;
    priceRs: number;
    dateAdded: Date;
    video: Blob;

    public constructor(itemName: string, description: string, category: Category, inStock: boolean, priceRs: number, dateAdded: Date, video: Blob) {
        this.itemName = itemName;
        this.description = description;
        this.category = category;
        this.inStock = inStock;
        this.priceRs = priceRs;
        this.dateAdded = dateAdded;
        this.video = video;
    }
}