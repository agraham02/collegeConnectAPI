const express = require("express");
const passport = require("passport");
const postsRouter = express.Router();
const postController = require("../controllers/postsController");
const queries = require("../models/queries");
const pool = require("../models/database");

async function paginateResults(req, res, next) {
    // return async (req, res, next) => {

    try {
        console.log("hey");
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const user = await req.user;

        const results = {};

        const queryResults = await queries.posts.getPosts(
            user.id,
            limit,
            startIndex
        );
        console.log(queryResults);
        results.results = queryResults;

        // console.log(endIndex);
        // console.log(results.results.length);

        const postLength = await (
            await pool.query("SELECT COUNT(id) FROM text_post")
        ).rows[0].count;
        console.log(parseInt(postLength));
        if (endIndex < postLength) {
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
        // res.json(results);
        res.paginatedResults = results;
        next();
    } catch (error) {
        res.status(500);
        return next(error);
    }

    // };
}

postsRouter.use(passport.authenticate("jwt", { session: false }));

postsRouter.get("/", paginateResults, postController.getPosts);

postsRouter.post("/", postController.insertNewPost);

postsRouter.get("/tags", postController.getTags);

postsRouter.get("/myPosts", postController.getPostByUserId);

postsRouter.get("/:postId", postController.getPostsById);

postsRouter.delete("/:postId", postController.deletePostById);

postsRouter.post("/:postId/like", postController.likePost);

postsRouter.delete("/:postId/unlike", postController.unlikePost);

postsRouter.get("/:postId/likes", postController.getLikesByPostId);

postsRouter.get("/:postId/comments", postController.getCommentsByPostId);

postsRouter.get(
    "/:postId/refresh",
    postController.refreshPostLikesAndCommentsCnt
);

postsRouter.post("/:postId/comment", postController.addComment);

postsRouter.get("/comments/:commentId", postController.getCommentByCommentId);

postsRouter.delete("/comments/:commentId", postController.deleteCommentById);

postsRouter.post("/comments/:commentId/like", postController.likeComment);

postsRouter.delete("/comments/:commentId/unlike", postController.unlikeComment);

module.exports = postsRouter;
