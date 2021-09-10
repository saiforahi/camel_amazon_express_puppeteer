const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var multer = require('multer')
var forms = multer();
const path = __dirname + '/react-web-app/view/build/';
const app = express();
app.use(express.static(path));

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
// app.use(forms.array());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});

// set port, listen for requests
const PORT = process.env.PORT || 8100;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});