const pool = require("../models/database");
const queries = require("../models/queries");

const getProfileByUsername = async (req, res, next) => {
    const { username } = req.params;
    const results = await queries.users.getUserByUsername(username);
    res.json(results);
};

const getIsFollower = async (myId, userId) => {
    const results = await (
        await pool.query(
            "SELECT * FROM user_following WHERE user_id = $1 AND user_following_id = $2",
            [userId, myId]
        )
    ).rows[0];
    console.log(results);
    return results !== undefined;
};

const getAmFollowing = async (myId, userId) => {
    const results = await (
        await pool.query(
            "SELECT * FROM user_following WHERE user_id = $1 AND user_following_id = $2",
            [myId, userId]
        )
    ).rows[0];
    console.log(results);
    return results !== undefined;
};

const getProfileDataById = async (req, res, next) => {
    const user = await req.user;
    const { userId } = req.params;
    const results = await queries.users.getUserById(userId);
    console.log(results);
    // results.isFollowing = await getFollowStatus();
    if (user.id !== userId) {
        results.is_follower = await getIsFollower(user.id, userId);
        results.am_following = await getAmFollowing(user.id, userId);
    } else {
        results.is_my_profile = true;
    }
    results.follower_cnt = await queries.users.getFollowerCnt(userId);
    results.following_cnt = await queries.users.getFollowingCnt(userId);
    res.json(results);
    // if (results) {
    //     const filteredResults = {
    //       bio: results.bio,
    //       birth_date: results.birth_date,
    //       email: results.email,
    //       first_name: results.first_name,
    //       graduation_date: null,
    //       // last_login: null,
    //       last_name: "Dummy",
    //       major_id: null,
    //       minor_id: null,
    //       profile_pic: null,
    //       registered_at: "2022-06-24T22:11:59.883Z",
    //       social_medias: null,
    //       username: "TD01",
    //     };
    //     res.json(filteredResults);
    // }
};

const deleteProfileById = async (req, res, next) => {
    const userId = req.body.userId;
    await queries.users.deleteUserById(userId);
    // req.body.temp = { message: "Hello"};
    // console.log(req.body);
    res.json("deleted user");
};

const followUser = async (req, res, next) => {
    const user = await req.user;
    const { userId } = req.params;
    await queries.users.followUser(user.id, userId);
    res.json("Followed user");
};

const unfollowUser = async (req, res, next) => {
    const user = await req.user;
    const { userId } = req.params;
    await queries.users.unfollowUser(user.id, userId);
    res.json("Unfollowed user");
};

const getFollowers = async (req, res, next) => {
    const user = await req.user;
    const results = await queries.users.getFollowers(user.id);
    res.json(results);
};

const getFollowings = async (req, res, next) => {
    const user = await req.user;
    const results = await queries.users.getFollowings(user.id);
    res.json(results);
};

const getFollowerCnt = async (req, res, next) => {
    const user = await req.user;
    const results = await queries.users.getFollowerCnt(user.id);
    res.json(results);
}

const getFollowingCnt = async (req, res, next) => {
    const user = await req.user;
    const results = await queries.users.getFollowingCnt(user.id);
    res.json(results);
};

const getLikesByUserId = async (req, res, next) => {
    const user = await req.user;
    const results = await queries.posts.likes.getLikesByUserId(user.id);
    res.json(results);
};

const getCommentLikesByUserId = async (req, res, next) => {
    const user = await req.user;
    let results = await queries.posts.comments.getCommentLikesByUserId(user.id);
    const { onlyUnderPost, commentId } = req.query;

    if (onlyUnderPost) {
        results = results.filter((commentLike) => {
            return commentLike.comment_id === Number.parseInt(commentId);
        });
    }
    res.json(results);
};

const updateBio = async (req, res, next) => {
    try {
        const user = await req.user;
        const { text } = req.body;
        await queries.users.updateUserBio(text, user.id);
        res.json("Successfully updated your bio");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const updateName = async (req, res, next) => {
    try {
        const user = await req.user;
        const { firstName, lastName } = req.body;
        await queries.users.updateName(firstName, lastName, user.id);
        res.json("Successfully updated your name");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const updateUsername = async (req, res, next) => {
    try {
        const user = await req.user;
        const { username } = req.body;
        const userWithThatName = await queries.users.getUserByUsername(
            username
        );
        if (userWithThatName) {
            return res.json("A user with that username already exists.");
        }
        await queries.users.updateUsername(username, user.id);
        res.json("Successfully updated your username");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

const updateSocialMedias = async (req, res, next) => {
    try {
        const user = await req.user;
        const {
            instagram,
            snapchat,
            facebook,
            linkedin,
            twitter,
            discord,
            email,
            website,
        } = req.body;
        const socialMedias = {
            instagram,
            snapchat,
            facebook,
            linkedin,
            twitter,
            discord,
            email,
            website,
        };
        await queries.users.updateSocialMedias(socialMedias, user.id);
        res.json("Successfully updated your social medias");
    } catch (error) {
        res.status(500);
        return next(error);
    }
};

module.exports = {
    getProfileByUsername,
    getProfileDataById,
    deleteProfileById,
    getLikesByUserId,
    getCommentLikesByUserId,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowings,
    getFollowerCnt, 
    getFollowingCnt,
    updateBio,
    updateName,
    updateUsername,
    updateSocialMedias,
};
