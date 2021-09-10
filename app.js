require('dotenv').config({ path: __dirname +`/.env` });
const camel_visitor = require('./scrapper');
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const port = 8002;
const cors = require("cors");
//
app.use(cors());
app.use(bodyParser.json({ limit: "1000mb" }));

app.use(express.static(path.join(__dirname, "/assets/")));
app.use(express.static(path.join(__dirname, "/")));

process.on("uncaughtException", function (err) {
    console.error(new Date().toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);
});

//Route setup
app.get("/", (req, res) => {
    res.send("<h3>Amazon Express Puppeteer</h3><code>version 1.0</code>");
    //scrapper(req.body.amazon_buyer_account)
});
app.post("/product-track", (req, res) => {
    if(req.body.token == 'c7cd413e3b646c5e73729fad31732a7f78b613472447cfc15fc22f0cf86d05f4'){
        res.json({ success: true })
        camel_visitor()
    }
    else{
        res.json({success:false})
    }
});

app.listen(port, (req, res) => {
    console.log(`server listening on port: ${port}`);
});
