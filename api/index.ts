import * as express from "express";
var cors = require('cors');
var app = module.exports = express.default();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(cors())

import authRouter from './routes/auth_router';
import itemsRouter from './routes/items_router';
import ordersRouter from './routes/orders_router';
import reviewsRouter from './routes/reviews_router';

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);

app.listen(process.env.PORT || 8000);
console.log(`Running the server on ${process.env.PORT || 8000} :nice:`);

