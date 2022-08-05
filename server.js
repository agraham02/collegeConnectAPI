const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const passport = require("passport");
const initializePassport = require("./passportConfig");
const cors = require("cors");

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
