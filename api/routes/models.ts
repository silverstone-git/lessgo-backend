export class User {
    userId: number | undefined;
    username: string;
    email: string;
    password: string;
    isVendor: boolean;
    lastLogin: Date | undefined;
    joinedDt: Date | undefined;

    public constructor(username: string, email: string, password: string, isVendor: boolean, lastLogin: Date | undefined = undefined, joinedDt: Date | undefined = undefined,  userId: number | undefined = undefined) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.lastLogin = lastLogin;
        this.joinedDt = joinedDt;
        this.isVendor = isVendor;
        this.userId = userId;
    }

    public static fromMap(map: any) {
        // returns a user instance
        return new User(map.username, map.email, map.password, map.is_vendor === 1 ? true : false, map.last_login, map.joined_dt, map.user_id);
    }
}


export enum Category {
    elec = "Electronic Accessories",
    mach = "Factory Machines",
    veh = "Vehicles",
    mat = "Material Components",
    fmcg = "FMCG Products",
    other = "Other",
}


export class Item {
    itemName: string;
    description: string;
    category: Category;
    inStock: boolean;
    priceRs: number;
    dateAdded: Date;
    image: string;
    video: string;

    public constructor(itemName: string, description: string, category: Category, inStock: boolean, priceRs: number, dateAdded: Date, image: string, video: string) {
        this.itemName = itemName;
        this.description = description;
        this.category = category;
        this.inStock = inStock;
        this.priceRs = priceRs;
        this.dateAdded = dateAdded;
        this.image = image;
        this.video = video;
    }

    public static toMap(item: Item) {
        // returns a user instance
        return {
        "itemName" : item.itemName,
        "description" : item.description,
        "category" : item.category,
        "inStock" : item.inStock,
        "priceRs" : item.priceRs,
        "dateAdded" : item.dateAdded,
        "image" : item.image,
        "video" : item.video,
        }
    }

    public static fromMap(map: any) {
        // returns an item instance from map
        return new Item(map.item_name, map.description, map.category, map.in_stock == 1 ? true : false, map.price_rs, map.date_added, map.image, map.video);
    }


}