import * as express from "express";
var cors = require('cors');
var app = module.exports = express.default();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(cors())

import authRouter from './routes/authRouter';
import itemsRouter from './routes/itemsRouter';
import ordersRouter from './routes/orders_router';

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);

app.listen(process.env.PORT || 8000);
console.log(`Running the server on ${process.env.PORT || 8000} :nice:`);

