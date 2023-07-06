# MySQL setup
- make your mysql account on your server and remember the username and password
- put the credentials in MYSQL_USER and MYSQL_PASSWORD environment variables resp.


- Make sure you are using mysql_native_password auth mode. If not, do it by logging in as root and-
> alter user 'YOUR_USERNAME_HERE' identified with mysql_native_password by 'YOUR_PASSWORD_HERE';


> create database lessgo;
> use lessgo;


## Users Table

> create table users (
>    user_id integer not null,
>    username varchar(200) not null,
>    email varchar(150) not null,
>    password varchar(300) not null,
>    is_vendor boolean not null,
>    last_login datetime,
>    joined_dt datetime,
>    address varchar(500),
>    auth_type varchar(50),
>    dp longtext,
>    primary key(user_id)
>)
> engine = INNODB;

## Items Table

> create table items (
>    item_id integer not null,
>    item_name varchar(200) not null,
>    description varchar(3000) not null,
>    category varchar(100) not null,
>    in_stock boolean not null,
>    price_rs float(13, 2),
>    date_added datetime not null,
>    image longtext,
>    video longtext,
>    hits bigint,
>    old_price  float(13, 2),
>    primary key(item_id)
>)
> engine = INNODB;

## Orders Table

> create table orders (
>    order_id integer not null auto_increment,
>    user_id integer not null,
>    item_id integer not null,
>    status tinyint(4),
>    count smallint unsigned,
>    cart_at datetime,
>    placed_at datetime,
>    received_at datetime,
>    listed_at datetime,
>    address varchar(500),
>    cart_id    integer,
>    primary key (order_id),
>    foreign key (user_id) references users(user_id) on update cascade on delete cascade,
>    foreign key (item_id) references items(item_id) on update cascade on delete restrict
>)
> engine = INNODB;

## Reviews Table

> create table reviews (
>    review_id integer not null auto_increment,
>    user_id integer not null,
>    item_id integer not null,
>    content varchar(3000) not null,
>    rating float(4, 2),
>    date_added datetime,
>    primary key (review_id),
>    foreign key (user_id) references users(user_id) on update cascade on delete restrict,
>    foreign key (item_id) references items(item_id) on update cascade on delete cascade
>)
> engine = INNODB;


# Environment Variables
- MYSQL_USERNAME
- MYSQL_PASSWORD
- MYSQL_DBNAME
- JWT_SECRET

# Running Dev Server
> npm install
> npm run start

# Compilation for the prod server
> npx tsc

# Running the prod server
> npm run prod