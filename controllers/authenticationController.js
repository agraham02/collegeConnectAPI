const pool = require("../models/database");
const passport = require("passport");
const bcrypt = require("bcrypt");
const queries = require("../models/queries");
const jwt = require("jsonwebtoken");
const { issueJWT } = require("../utils");

const passwordHash = async (password, saltRounds) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw error;
    }
};

const comparePasswords = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        throw error;
    }
};

const logIn = async (req, res, next) => {
    const { username, password } = req.body;
    const dbUser = await queries.users.getUserByUsername(username);
    //   console.log(dbUser);

    if (!dbUser) {
        return res.status(401).json("User not found");
    }

    const rightPassword = await comparePasswords(password, dbUser.password);
    if (rightPassword) {
        const accessToken = issueJWT(dbUser);
        res.json({ dbUser, accessToken });
    } else {
        return res.status(401).json("Password is incorrect");
    }
};

const register = async (req, res, next) => {
    console.log("Hello");
    const { firstName, lastName, username, email, password } = req.body; //birthdate
    const birthDate = new Date("May 11, 2002");
    try {
        //check if user with given username already exists
        const existingUser = await queries.users.getUserByUsername(username);
        if (existingUser) {
            res.status(404);
            return next(new Error("User with that username already exists"));
        }
        const hashedPassword = await passwordHash(password, 10);
        await queries.users.insertNewUser(
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            birthDate
        );
        res.json("New user added");
    } catch (error) {
        res.status(500);
        const e = new Error(`Something happened with our servers.`);
        next(e);
    }
};

module.exports = {
    logIn,
    register,
};
