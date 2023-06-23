export class User {
    userId: number | undefined;
    username: string;
    email: string;
    password: string;
    isVendor: boolean;
    lastLogin: Date | undefined;
    joinedDt: Date | undefined;
    address: string;

    public constructor(username: string, email: string, password: string, isVendor: boolean, lastLogin: Date | undefined = undefined, joinedDt: Date | undefined = undefined,  userId: number | undefined = undefined, address: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.lastLogin = lastLogin;
        this.joinedDt = joinedDt;
        this.isVendor = isVendor;
        this.userId = userId;
        this.address = address;
    }

    public static fromMap(map: any) {
        // returns a user instance
        return new User(map.username, map.email, map.password, map.is_vendor === 1 ? true : false, map.last_login, map.joined_dt, map.user_id, map.address);
    }

    public static johnDoe() {
        return new User('', '', '', false, undefined, undefined, undefined, '');
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

export const initCategoryCarousels: {
    fmcg: Array<Array<string>>,
    veh: Array<Array<string>>,
    elec:Array<Array<string>>,
    mat: Array<Array<string>>, 
    other: Array<Array<string>>, 
    mach: Array<Array<string>>, 
  } = {
    elec: [],
    veh: [],
    mat: [],
    fmcg: [],
    mach: [],
    other: [],
}

export interface ItemInterface {
    item_id: number | undefined;
    item_name: string;
    description: string;
    category: Category;
    in_stock: boolean;
    price_rs: number;
    date_added: Date;
    image: string;
    video: string;
}


export class Item {
    itemId: number | undefined;
    itemName: string;
    description: string;
    category: Category;
    inStock: boolean;
    priceRs: number;
    dateAdded: Date;
    image: string;
    video: string;
    hits: number;

    public constructor(itemName: string, description: string, category: Category, inStock: boolean, priceRs: number, dateAdded: Date, image: string, video: string, itemId: number | undefined, hits: number = 0) {
        this.itemName = itemName;
        this.description = description;
        this.category = category;
        this.inStock = inStock;
        this.priceRs = priceRs;
        this.dateAdded = dateAdded;
        this.image = image;
        this.video = video;
        this.itemId = itemId;
        this.hits = hits;
    }

    public static toMap(item: Item) {
        // returns a user instance
        return {
        "item_name" : item.itemName,
        "description" : item.description,
        "category" : item.category,
        "in_stock" : item.inStock,
        "price_rs" : item.priceRs,
        "date_added" : item.dateAdded,
        "image" : item.image,
        "video" : item.video,
        "item_id": item.itemId,
        "hits": item.hits,
        }
    }

    public static fromMap(map: any) {
        // returns an item instance from map
        return new Item(map.item_name, map.description, map.category, map.in_stock === 1 ? true : false, map.price_rs, map.date_added, map.image, map.video, map.item_id, map.hits);
    }


    public static fromMapCamelCase(map: any) {
        // returns an item instance from map
        return new Item(map.itemName, map.description, map.category, map.inStock === 1 ? true : false, map.priceRs, map.dateAdded, map.image, map.video, map.itemId, map.hits);
    }

    public static johnDoe() {
        return new Item('', '', Category.other, false, 0,new Date(), '', '', undefined, 0);
    }

}

export class CartItem extends Item {
    count: number;
    cartAt: Date;
    orderId: number | undefined;

    public constructor(itemName: string, description: string, category: Category, inStock: boolean, priceRs: number, dateAdded: Date, image: string, video: string, itemId: number | undefined, count: number, cartAt: Date, orderId: number | undefined, hits: number = 0) {
        super(itemName, description, category, inStock, priceRs, dateAdded, image, video, itemId, hits);
        this.count = count;
        this.cartAt = cartAt;
        this.orderId = orderId;

    };

    public static fromMap(map: any) {
        // returns an item instance from map
        return new CartItem(map.item_name, map.description, map.category, map.in_stock === 1 ? true : false, map.price_rs, map.date_added, map.image, map.video, map.item_id, map.count, map.cart_at, map.order_id, map.hits);
    }

    public static toMap(cartItem: CartItem): any {
        // returns an object
        return {
            ...super.toMap(new Item(cartItem.itemName, cartItem.description, cartItem.category, cartItem.inStock, cartItem.priceRs, cartItem.dateAdded, cartItem.image, cartItem.video, cartItem.itemId, cartItem.hits)),
            "count": cartItem.count,
            "date_added": cartItem.dateAdded,
            "order_id": cartItem.orderId,
        }
    }

    public static toMaps(cartItems: Array<CartItem>): Array<any> {
        const cartObjs: Array<any> = [];
        for( var i = 0; i < cartItems.length; i ++) {
            cartObjs.push(CartItem.toMap(cartItems[i]));
        }
        return cartObjs;
    }

    public static async mapFromItem(item: any, passedCount: number, passedDateAdded: Date, passedOrderId: number) {
        // returns an object
        return {
            ...Item.toMap(item),
            "count": passedCount,
            "date_added": passedDateAdded,
            "order_id": passedOrderId,
        }
    }
}

export class Order {
    orderId: number;
    userId: number;
    itemId: number;
    status: number;
    count: number;
    cartAt: Date;
    placedAt: Date | undefined;
    receivedAt: Date | undefined;
    listedAt: Date | undefined;
    address: string;

    public constructor(orderId: number, userId: number, itemId: number, status: number, count: number, cartAt: Date, placedAt: Date | undefined, receivedAt: Date | undefined, listedAt: Date | undefined, address: string) {
        this.orderId = orderId;
        this.userId = userId;
        this.itemId = itemId;
        this.status = status;
        this.count = count;
        this.cartAt = cartAt;
        this.placedAt = placedAt;
        this.receivedAt = receivedAt;
        this.listedAt = listedAt;
        this.address = address;
    }

    public static toMap(order: Order) {
        // returns an order instance
        return {
            orderId : order.orderId,
            userId : order.userId,
            itemId : order.itemId,
            status : order.status,
            count : order.count,
            cartAt : order.cartAt,
            placedAt : order.placedAt,
            receivedAt : order.receivedAt,
            listedAt : order.listedAt,
            address : order.address
        }
    }

    public static fromMap(map: any) {
        // returns an order instance from map
        return new Order(map.order_id, map.user_id, map.item_id, map.status, map.count, map.cart_at, map.placed_at, map.received_at, map.listed_at, map.address);
    }

}


export class Review {
    reviewId: number | undefined;
    userId: number;
    itemId: number;
    content: string;
    rating: number;
    dateAdded: Date;

    public constructor(reviewId: number | undefined, userId: number, itemId: number, content: string, rating: number, dateAdded: Date) {
        this.reviewId = reviewId;
        this.userId = userId;
        this.itemId = itemId;
        this.content = content;
        this.rating = rating;
        this.dateAdded = dateAdded;
    }

    public static toMap(review: Review) {
        // returns a review instance
        return {
            reviewId : review.reviewId,
            userId : review.userId,
            itemId : review.itemId,
            content : review.content,
            rating : review.rating,
            dateAdded : review.dateAdded,
        }
    }

    public static fromMap(map: any) {
        // returns an review instance from map
        return new Review(map.review_id, map.user_id, map.item_id, map.content, map.rating, map.date_added);
    }

}