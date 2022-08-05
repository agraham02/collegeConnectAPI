const { users } = require("../models/queries");
const queries = require("../models/queries");



const getPosts = async (req, res, next) => {
    try {
        // const page = parseInt(req.query.page);
        // const limit = parseInt(req.query.limit);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        // const user = await req.user;
        // const results = {};
        // results.results = (await queries.posts.getPosts(user.id)).slice(
        //     startIndex,
        //     endIndex
        // );
        // console.log(endIndex);
        // console.log(results.results.length);
        // if (endIndex < results.results.length) {
        //     //fix
        //     results.next = {
        //         page: page + 1,
        //         limit,
        //     };
        // }
        // if (startIndex > 0) {
        //     results.previous = {
        //         page: page - 1,
        //         limit,
        //     };
        // }
        // res.json(results);
        // res.send("Test");
        res.json(res.paginatedResults);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const getPostsById = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const results = await queries.posts.getPostsById(postId);
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const getPostByUserId = async (req, res, next) => {
    try {
        const user = await req.user;
        const results = await queries.posts.getPostByUserId(user.id);
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const insertNewPost = async (req, res, next) => {
    try {
        const user = await req.user;
        const {
            text,
            tag1,
            tag2,
            tag3,
            isPinned,
            isAdvertised,
            isSensative,
            isAnonymous,
            expiresIn,
        } = req.body;
        //   console.log(user);
        //   console.log(text);
        await queries.posts.insertNewPost(
            user.id,
            text,
            tag1,
            tag2,
            tag3,
            isPinned,
            isAdvertised,
            isSensative,
            isAnonymous,
            expiresIn
        );
        res.json({ message: "Your post was successfully posted" });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const deletePostById = async (req, res, next) => {
    try {
        const { postId } = req.params;
        console.log(postId);
        await queries.posts.deletePostById(postId);
        res.json({ message: "Your post was successfully deleted" });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const likePost = async (req, res, next) => {
    try {
        const user = await req.user;
        const { postId } = req.params;
        await queries.posts.likes.likePost(user.id, postId);
        res.json("Liked post");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const unlikePost = async (req, res, next) => {
    try {
        const user = await req.user;
        const { postId } = req.params;
        await queries.posts.likes.unlikePost(user.id, postId);
        res.json("Unliked post");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const getLikesByPostId = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const results = await queries.posts.likes.getLikesByPostId(postId);
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const addComment = async (req, res, next) => {
    try {
        const user = await req.user;
        const { postId } = req.params;
        const { text, isPinned, isSensative, isAnonymous, parentCommentId } =
            req.body;

        await queries.posts.comments.insertNewComment(
            user.id,
            postId,
            text,
            isPinned,
            isSensative,
            isAnonymous,
            parentCommentId
        );
        res.json({ message: "Your comment was successfully posted" });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const deleteCommentById = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        await queries.posts.comments.deleteCommentById(commentId);
        res.json({ message: "Your comment was successfully deleted" });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const getCommentsByPostId = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const user = await req.user;
        const results = await queries.posts.comments.getCommentsByPostId(
            postId,
            user.id
        );
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const getCommentByCommentId = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const user = await req.user;
        const getChildComments = req.query.getChildComments;
        let results;
        if (getChildComments) {
            console.log("Here");
            results = await queries.posts.comments.getCommentsByParentCommentId(
                commentId,
                user.id
            );
        } else {
            console.log("THere");
            results = await queries.posts.comments.getCommentByCommentId(
                commentId
            );
        }
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const likeComment = async (req, res, next) => {
    try {
        const user = await req.user;
        const { commentId } = req.params;
        await queries.posts.comments.likeComment(user.id, commentId);
        res.json("liked comment");
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const unlikeComment = async (req, res, next) => {
    try {
        const user = await req.user;
        const { commentId } = req.params;
        await queries.posts.comments.unlikeComment(user.id, commentId);
        res.json("unlike comment");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const refreshPostLikesAndCommentsCnt = async (req, res, next) => {
    try {
        const user = await req.user;
        const { postId } = req.params;
        const likeCnt = await queries.posts.likes.getPostsLikesCnt(postId);
        const commentCnt = await queries.posts.comments.getPostsCommentCnt(
            postId
        );
        const isLiked = await queries.posts.getPostIsLiked(postId, user.id);
        res.json({
            like_cnt: likeCnt,
            comment_cnt: commentCnt,
            is_liked: isLiked,
        });
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const getTags = async (req, res, next) => {
    try {
        const results = await queries.posts.getTags();
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const searchPostText = async (req, res, next) => {
    try {
        const { searchParam } = req.query;
        const results = await queries.posts.searchPostText();
        res.json(results);
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

module.exports = {
    getPosts,
    getPostsById,
    getPostByUserId,
    insertNewPost,
    deletePostById,
    likePost,
    unlikePost,
    getLikesByPostId,
    addComment,
    deleteCommentById,
    getCommentsByPostId,
    getCommentByCommentId,
    getTags,
    likeComment,
    unlikeComment,
    refreshPostLikesAndCommentsCnt,
};
