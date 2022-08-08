const jwt = require("jsonwebtoken");
const pool = require("./models/database");

function issueJWT(user) {
    const id = user.id;

    const expiresIn = "2d";

    const payload = {
        sub: id,
        iat: Date.now(),
    };

    const signedToken = jwt.sign(payload, process.env.SECRET);

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn,
    };
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        res.status(401);
    }
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            res.status(403);
        }
        req.user = user;
        next();
    });
};

function paginatedResults(modal) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const user = await req.user;

        const results = {};

        const queryResults = await pool.query(
            "SELECT posts.id, posts.written_text, posts.tag_1, posts.tag_2, posts.tag_3, posts.is_pinned, posts.is_advertised, posts.is_sensative, posts.is_anonymous, posts.created_at, posts.expires_in, profile.id AS user_id, profile.first_name, profile.last_name, profile.username, profile.profile_pic_url FROM user_post AS posts LEFT JOIN user_profile AS profile ON posts.user_id = profile.id ORDER BY posts.created_at DESC LIMIT $1 OFFSET $2",
            [limit, startIndex]
        );
        results.results = queryResults;

        console.log(endIndex);
        console.log(results.results.length);

        if (endIndex < results.results.length) {
            //fix
            results.next = {
                page: page + 1,
                limit,
            };
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit,
            };
        }
        res.json(results);
        next();
    };
}

module.exports.authenticateToken = authenticateToken;
module.exports.issueJWT = issueJWT;
