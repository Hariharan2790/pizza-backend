const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const mongoClient = mongodb.MongoClient;
//const URL = "mongodb://localhost:27017";
const URL = "mongodb+srv://hariharan:viji123@cluster0.mlpu8.mongodb.net?retryWrites=true&w=majority";

const jwt = require("jsonwebtoken");

const secret = "VZO9jO1pCe";
let userList = [];
app.use(express.json());

app.use(cors({
    origin: "*"
}));

let authenticate = function (req, res, next) {
    if (req.headers.authorization) {
        try {
            let result = jwt.verify(req.headers.authorization, secret);
            next();
        } catch (error) {
            res.status(401).json({ message: "Token Invalid" })
        }
    } else {
        res.status(401).json({ message: "Not Authorized" })
    }
}

app.get("/user", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("pizza");
        let user = await db.collection("users").find({}).toArray();
        await connection.close();
        res.json(user);
    } catch (error) {
        console.log(error);
    }
    
});

//User Create

app.post("/createuser", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("pizza");
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        await db.collection("users").insertOne(req.body)
        connection.close();
        res.json({ message: "User Created" })
    } catch (error) {
        console.log(error)
    }
})

//User Login
app.post("/user-login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("pizza");
        let user = await db.collection("users").findOne({ email: req.body.email });
        if (user) {
            let passwordResult = bcrypt.compare(req.body.password, user.password);
            if (passwordResult) {
                let token = jwt.sign({ userid: user._id }, secret, { expiresIn: '1h'})
                res.json({ token })
            } else {
                res.status(401).json({ message: "email or password not match" })
            }

        } else {
            res.status(401).json({ message: "No user found" })
        }
    } catch (error) {
        console.log(error)
    }
})
app.get("/user-dashboard", authenticate, function (req, res) {
    res.json({ totalUsers: 20 })
});

//Admin Create

app.post("/admincreate", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("pizza");
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        await db.collection("admins").insertOne(req.body)
        connection.close();
        res.json({ message: "User Created" })
    } catch (error) {
        console.log(error)  
    }
})

//Admin Login
app.post("/admin-login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("pizza");
        let user = await db.collection("admins").findOne({ email: req.body.email});
        if (user) {
            let passwordResult = bcrypt.compare(req.body.password, user.password);
            if (passwordResult) {
                let token = jwt.sign({ userid: user._id }, secret, { expiresIn:'1h'})
                res.json({ token })
            } else {
                res.status(401).json({ message: "email or password not match" })
            }

        } else {
            res.status(401).json({ message: "No user found" })
        }
    } catch (error) {
        console.log(error)
    }
})
app.get("/admin-dashboard", authenticate, function (req, res) {
    res.json({ totalUsers: 20 })
});


app.listen(process.env.PORT || 3000);