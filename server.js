const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const passport = require("passport");
const initializePassport = require("./passportConfig");
const cors = require("cors");
const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: "hqfjdwd2z",
    api_key: "975734821322458",
    api_secret: "R8W-FXgeFi9qy_EVoiz51-HJ-Qg",
});

const postsRouter = require("./routes/postsRoute");
const authenticationRouter = require("./routes/authenticationRoute");
const profileRouter = require("./routes/profileRoute");

const app = express();

initializePassport(passport);

dotenv.config();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/posts", postsRouter);
app.use("/profile", profileRouter);
app.use("/", authenticationRouter);

app.get("/", (req, res) => {
    res.json("College Connect!");
});

app.get("/error", (req, res, next) => {
    // const e = new Error(`Server Error: Test`);
    // e.status = 500;
});

// app.post("/cloudinary", (req, res, next) => {
//     cloudinary.v2.uploader.upload(
//         "./src/images/legoman-1.jpg",
//         {
//             public_id: "legoMan",
//         },
//         (err, result) => {
//             console.log(result);
//             res.json(result)
//         }
//     );
// });

// app.get("/img", (req, res, next) => {
//     // res.send(
//     //     "http://res.cloudinary.com/hqfjdwd2z/image/upload/v1659817031/legoMan.jpg"
//     // );
//     res.sendFile(
//         "http://res.cloudinary.com/hqfjdwd2z/image/upload/v1659817031/legoMan.jpg"
//     );
// })

app.get("*", (req, res) => {
    res.json("That path does not exists");
});

app.use((err, req, res, next) => {
    const errorMessage = err.message;
    console.error(`${err}`);
    res.json({ error: errorMessage });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
});
