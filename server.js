const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/error");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, './uploads')))
if (process.env.NODE_ENV == "production") {
  console.log = function () { };
}
app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
const category = require("./routes/categoryRoute");
const address = require("./routes/addressRoute");
const vender = require("./routes/venderRoute");
const coupon = require("./routes/couponRoute");
const cart = require("./routes/cartRoutes");
const notify = require('./routes/notification')
const driver = require('./routes/driver_Router');
const banner = require('./routes/banner')
// const help = require('./routes/helpandsupport');
const terms = require('./routes/terms');
const policy = require('./routes/policy');
const faq = require('./routes/faqAboutus');
const subscription = require('./routes/subsription');


app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", category);
app.use("/api/v1", address);
app.use("/api/v1/vender", vender);
app.use("/api/v1/coupon", coupon);
app.use("/api/v1/cart", cart);
app.use('/api/v1/driver', driver);
app.use('/api/v1/notify', notify);
app.use('/api/v1/banner', banner)
// app.use('/api/v1/help', help);
app.use('/api/v1/terms', terms);
app.use('/api/v1/privacy', policy);
app.use('/api/v1/faq', faq);
app.use('/api/v1/subscription', subscription);
app.use(errorMiddleware);

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, }).then((data) => {
  console.log(`Mongodb connected with server: ${data.connection.host}`);
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}!`);
});

module.exports = { handler: serverless(app) };