# MySQL setup
- make your mysql account on your server and remember the username and password
- put the credentials in MYSQL_USER and MYSQL_PASSWORD environment variables resp.
> create database lessgo;
> use lessgo;
> create table users (
>    user_id integer not null,
>    username varchar(200) not null,
>    email varchar(150) not null,
>    password varchar(50) not null,
>    is_vendor boolean not null,
>    last_login datetime,
>    joined_dt datetime,
>    primary key(user_id)
>)
> engine = INNODB;

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
>    primary key(item_id)
>)
> engine = INNODB;

> create table orders (
>    order_id integer not null auto_increment,
>    user_id integer not null,
>    item_id integer not null,
>    status tinyint(4),
>    count smallint,
>    cart_at datetime,
>    placed_at datetime,
>    received_at datetime,
>    primary key (order_id),
>    foreign key (user_id) references users(user_id) on update cascade on delete cascade,
>    foreign key (item_id) references items(item_id) on update cascade on delete restrict
>)
> engine = INNODB;

> create table reviews (
>    review_id integer not null auto_increment,
>    user_id integer not null,
>    item_id integer not null,
>    content varchar(3000) not null,
>    rating float(4, 2),
>    primary key (review_id),
>    foreign key (user_id) references users(user_id) on update cascade on delete restrict,
>    foreign key (item_id) references items(item_id) on update cascade on delete cascade
>)
> engine = INNODB;

- Convert your password to mysql.js supported auth mode by logging in as root and-
> alter user 'YOUR_USERNAME_HERE' identified with mysql_native_password by 'YOUR_PASSWORD_HERE';

# Backend Server
- Create a random JWT secret for your server and put it in the environment variable JWT_SECRET
- run in the root folder-
> npm install
> npm run start