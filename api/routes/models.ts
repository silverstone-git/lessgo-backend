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
    itemId: number | undefined;
    itemName: string;
    description: string;
    category: Category;
    inStock: boolean;
    priceRs: number;
    dateAdded: Date;
    image: string;
    video: string;

    public constructor(itemName: string, description: string, category: Category, inStock: boolean, priceRs: number, dateAdded: Date, image: string, video: string, itemId: number | undefined) {
        this.itemName = itemName;
        this.description = description;
        this.category = category;
        this.inStock = inStock;
        this.priceRs = priceRs;
        this.dateAdded = dateAdded;
        this.image = image;
        this.video = video;
        this.itemId = itemId;
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
        }
    }

    public static fromMap(map: any) {
        // returns an item instance from map
        return new Item(map.item_name, map.description, map.category, map.in_stock === 1 ? true : false, map.price_rs, map.date_added, map.image, map.video, map.item_id);
    }


}

export class CartItem extends Item {
    count: number;
    cartAt: Date;

    public constructor(itemName: string, description: string, category: Category, inStock: boolean, priceRs: number, dateAdded: Date, image: string, video: string, itemId: number | undefined, count: number, cartAt: Date) {
        super(itemName, description, category, inStock, priceRs, dateAdded, image, video, itemId);
        this.count = count;
        this.cartAt = cartAt;

    }

    public static fromMap(map: any) {
        // returns an item instance from map
        return new CartItem(map.item_name, map.description, map.category, map.in_stock === 1 ? true : false, map.price_rs, map.date_added, map.image, map.video, map.item_id, map.count, map.cart_at);
    }

    public static toMap(cartItem: CartItem) {
        // returns an order instance
        return {
            ...super.toMap(new Item(cartItem.itemName, cartItem.description, cartItem.category, cartItem.inStock, cartItem.priceRs, cartItem.dateAdded, cartItem.image, cartItem.video, cartItem.itemId)),
            "count": cartItem.count,
            "date_added": cartItem.dateAdded,
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

    public constructor(orderId: number, userId: number, itemId: number, status: number, count: number, cartAt: Date, placedAt: Date | undefined, receivedAt: Date | undefined, listedAt: Date | undefined) {
        this.orderId = orderId;
        this.userId = userId;
        this.itemId = itemId;
        this.status = status;
        this.count = count;
        this.cartAt = cartAt;
        this.placedAt = placedAt;
        this.receivedAt = receivedAt;
        this.listedAt = listedAt;
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
            listedAt : order.listedAt
        }
    }

    public static fromMap(map: any) {
        // returns an order instance from map
        return new Order(map.order_id, map.user_id, map.item_id, map.status, map.count, map.cart_at, map.placed_at, map.received_at, map.listed_at);
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