const pool = require("./database");
const { v4: uuidv4 } = require("uuid");

const selectStatement = () => {};

const insertStatement = () => {};

const updateStatement = () => {};

const deleteStatement = () => {};

//Users
const insertNewUser = async (
    firstName,
    lastName,
    username,
    email,
    hashedPassword,
    birthDate
) => {
    const id = uuidv4();
    await pool.query(
        "INSERT INTO user_profile (id, first_name, last_name, username, email, password_h, birth_date) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, firstName, lastName, username, email, hashedPassword, birthDate]
    );
};

const getUserByUsername = async (username) => {
    const result = await (
        await pool.query("SELECT * FROM user_profile WHERE username = $1", [
            username,
        ])
    ).rows[0];
    return result;
};

const getUserById = async (id) => {
    const result = await (
        await pool.query("SELECT * FROM user_profile WHERE id = $1", [id])
    ).rows[0];
    return result;
};

const updateUserById = async (
    firstName,
    lastName,
    username,
    email,
    password,
    bio,
    profilePic,
    major,
    minor,
    graduationDate
) => {};

const updateUserBio = async (text, userId) => {
    await pool.query("UPDATE user_profile SET bio = $1 WHERE id = $2", [
        text,
        userId,
    ]);
};

const updateName = async (firstName, lastName, userId) => {
    await pool.query(
        "UPDATE user_profile SET first_name = $1, last_name = $2 WHERE id = $3",
        [firstName, lastName, userId]
    );
};

const updateUsername = async (username, userId) => {
    await pool.query("UPDATE user_profile SET username = $1 WHERE id = $2", [
        username,
        userId,
    ]);
};

const updateSocialMedias = async (socialMedias, userId) => {
    await pool.query(
        "UPDATE user_profile SET social_medias = $1 WHERE id = $2",
        [socialMedias, userId]
    );
};

const updateUserSettingsByUserId = async (
    showAge,
    showGradYear,
    showLastName
) => {};

const deleteUserById = async (userId) => {
    await pool.query("DELETE FROM user_profile WHERE id = $1", [userId]);
};

//Posts
const insertNewPost = async (
    userId,
    text,
    tag1,
    tag2,
    tag3,
    isPinned,
    isAdvertised,
    isSensative,
    isAnonymous,
    expiresIn
) => {
    await pool.query(
        "INSERT INTO user_post (user_id, written_text, tag_1, tag_2, tag_3, is_pinned, is_advertised, is_sensative, is_anonymous, expires_in) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [
            userId,
            text,
            tag1,
            tag2,
            tag3,
            isPinned,
            isAdvertised,
            isSensative,
            isAnonymous,
            expiresIn,
        ]
    );
};

const getPosts = async (userId, limit, startIndex) => {
    const results = await (
        await pool.query(
            "SELECT posts.id, posts.written_text, posts.media_url, posts.tag_1, posts.tag_2, posts.tag_3, posts.repost_id, posts.is_pinned, posts.is_advertised, posts.is_sensative, posts.is_anonymous, posts.created_at, posts.is_story, posts.expires_in, profile.id AS user_id, profile.first_name, profile.last_name, profile.username, profile.profile_pic_url FROM user_post AS posts LEFT JOIN user_profile AS profile ON posts.user_id = profile.id ORDER BY posts.created_at DESC LIMIT $1 OFFSET $2",
            [limit, startIndex]
        )
    ).rows;
    await setPostData(results, userId);
    // console.log(results);
    return results;
};

const setPostData = async (posts, userId) => {
    for (const post of posts) {
        console.log(post);
        const postId = post.id;
        const likeCnt = await getPostsLikesCnt(postId);
        const commentCnt = await getPostsCommentCnt(postId);
        const isLiked = await getPostIsLiked(postId, userId);
        const tags = await getPostTags(post);
        post.like_cnt = likeCnt;
        post.comment_cnt = commentCnt;
        post.is_liked = isLiked;
        post.tags = tags;
    }
};

const getPostsLikesCnt = async (postId) => {
    const results = await (
        await pool.query(
            "SELECT COUNT(post_like.id) AS like_cnt FROM post_like WHERE post_id = $1",
            [postId]
        )
    ).rows[0];
    return results.like_cnt;
};

const getPostsCommentCnt = async (postId) => {
    const results = await (
        await pool.query(
            "SELECT COUNT(text_comment.id) AS comment_cnt FROM text_comment WHERE post_id = $1",
            [postId]
        )
    ).rows[0];
    return results.comment_cnt;
};

const getPostIsLiked = async (postId, userId) => {
    const results = await (
        await pool.query(
            "SELECT * FROM post_like WHERE user_id = $1 AND post_id = $2",
            [userId, postId]
        )
    ).rows[0];
    // console.log(results);
    if (results) {
        return true;
    } else {
        return false;
    }
};

const getPostTags = async (post) => {
    const ans = [];
    const tag1 = post.tag_1
        ? await (
              await pool.query("SELECT * FROM post_tag WHERE id = $1", [
                  post.tag_1,
              ])
          ).rows[0]
        : null;
    const tag2 = post.tag_2
        ? await (
              await pool.query("SELECT * FROM post_tag WHERE id = $1", [
                  post.tag_2,
              ])
          ).rows[0]
        : null;
    const tag3 = post.tag_3
        ? await (
              await pool.query("SELECT * FROM post_tag WHERE id = $1", [
                  post.tag_3,
              ])
          ).rows[0]
        : null;

    if (tag1) {
        ans.push(tag1);
    }
    if (tag2) {
        ans.push(tag2);
    }
    if (tag3) {
        ans.push(tag3);
    }

    // return [tag1, tag2, tag3];
    return ans;
};

const getPostsById = async (postId) => {
    const post = await (
        await pool.query(
            "SELECT posts.*, profile.first_name, profile.last_name, profile.username, profile.profile_pic, COUNT(likes.id) AS likes_cnt, COUNT(text_comment.id) AS comments_cnt FROM user_post AS posts LEFT JOIN user_profile AS profile ON posts.user_id = profile.id LEFT JOIN post_like AS likes ON posts.id = likes.post_id LEFT JOIN text_comment ON posts.id = text_comment.post_id WHERE posts.id = $1 GROUP BY posts.id, profile.first_name, profile.last_name, profile.username, profile.profile_pic ORDER BY posts.created_at DESC",
            [postId]
        )
    ).rows[0];
    const comments = await getCommentsByPostId(postId, true);
    return { post, comments };
};

const getPostByUserId = async (userId) => {
    const results = await (
        await pool.query(
            "SELECT posts.id, posts.written_text, posts.tag_1, posts.tag_2, posts.tag_3, posts.is_pinned, posts.is_advertised, posts.is_sensative, posts.is_anonymous, posts.created_at, posts.expires_in, profile.id AS user_id, profile.first_name, profile.last_name, profile.username, profile.profile_pic FROM user_post AS posts LEFT JOIN user_profile AS profile ON posts.user_id = profile.id WHERE posts.user_id = $1 ORDER BY posts.created_at DESC",
            [userId]
        )
    ).rows;
    await setPostData(results, userId);
    return results;
};

const deletePostById = async (postId) => {
    await pool.query("DELETE FROM user_post WHERE id = $1", [postId]);
};

const searchPostText = async (searchParam) => {
    const results = await (
        await pool.query(
            "SELECT * FROM user_post WHERE written_text LIKE '%$1%'",
            [searchParam]
        )
    ).rows;
    return results;
};

//Likes
const likePost = async (userId, postId) => {
    await pool.query(
        "INSERT INTO post_like (user_id, post_id) VALUES ($1, $2)",
        [userId, postId]
    );
};

const getLikesByPostId = async (postId) => {
    const results = await (
        await pool.query("SELECT * FROM post_like WHERE post_id = $1", [postId])
    ).rows;
    return results;
};

const getLikesByUserId = async (userId) => {
    const results = await (
        await pool.query("SELECT * FROM post_like WHERE user_id = $1", [userId])
    ).rows;
    console.log(results);
    return results;
};

const unlikePost = async (userId, postId) => {
    await pool.query(
        "DELETE FROM post_like WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
    );
};

//Comments
const insertNewComment = async (
    userId,
    postId,
    text,
    isPinned,
    isSensative,
    isAnonymous,
    parentCommentId
) => {
    await pool.query(
        "INSERT INTO text_comment (user_id, post_id, written_text, is_pinned, is_sensative, is_anonymous, parent_comment_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
            userId,
            postId,
            text,
            isPinned,
            isSensative,
            isAnonymous,
            parentCommentId,
        ]
    );
};

const deleteCommentById = async (commentId) => {
    await pool.query("DELETE FROM text_comment WHERE id = $1", [commentId]);
};

const getCommentsByPostId = async (postId, userId) => {
    const results = await (
        await pool.query(
            "SELECT text_comment.id, text_comment.post_id, text_comment.parent_comment_id, text_comment.written_text, text_comment.is_pinned, text_comment.is_sensative, text_comment.is_anonymous, text_comment.created_at, profile.id AS user_id, profile.first_name, profile.last_name, profile.username, profile.profile_pic FROM text_comment LEFT JOIN user_profile AS profile ON text_comment.user_id = profile.id WHERE text_comment.post_id = $1 AND text_comment.parent_comment_id IS NULL ORDER BY text_comment.created_at DESC",
            [postId]
        )
    ).rows;
    // console.log(results);
    for (const result of results) {
        console.log(result);
        const commentId = result.id;
        const likeCnt = await getCommentLikeCnt(commentId);
        const commentCnt = await getCommentCommentCnt(commentId);
        const isLiked = await commentIsLiked(commentId, userId);
        result.like_cnt = likeCnt;
        result.comment_cnt = commentCnt;
        result.is_liked = isLiked;
    }
    console.log(results);

    return results;
};

const getCommentByCommentId = async (commentId) => {
    const result = await (
        await pool.query(
            "SELECT text_comment.id, text_comment.post_id, text_comment.parent_comment_id, text_comment.written_text, text_comment.is_pinned, text_comment.is_sensative, text_comment.is_anonymous, text_comment.created_at, profile.id AS user_id, profile.first_name, profile.last_name, profile.username, profile.profile_pic FROM text_comment LEFT JOIN user_profile AS profile ON text_comment.user_id = profile.id WHERE text_comment.id = $1 ORDER BY text_comment.created_at DESC",
            [commentId]
        )
    ).rows[0];
    return result;
};

const getCommentsByParentCommentId = async (commentId, userId) => {
    const results = await (
        await pool.query(
            "SELECT text_comment.id, text_comment.post_id, text_comment.parent_comment_id, text_comment.written_text, text_comment.is_pinned, text_comment.is_sensative, text_comment.is_anonymous, text_comment.created_at, profile.id AS user_id, profile.first_name, profile.last_name, profile.username, profile.profile_pic FROM text_comment LEFT JOIN user_profile AS profile ON text_comment.user_id = profile.id WHERE text_comment.parent_comment_id = $1 ORDER BY text_comment.created_at ASC",
            [commentId]
        )
    ).rows;
    for (const result of results) {
        console.log(result);
        const commentId = result.id;
        const likeCnt = await getCommentLikeCnt(commentId);
        const commentCnt = await getCommentCommentCnt(commentId);
        const isLiked = await commentIsLiked(commentId, userId);
        result.like_cnt = likeCnt;
        result.comment_cnt = commentCnt;
        result.is_liked = isLiked;
    }
    console.log(results);

    return results;
};

const getCommentLikeCnt = async (commentId) => {
    const result = await (
        await pool.query(
            "SELECT COUNT(id) AS like_cnt FROM comment_like WHERE comment_id = $1",
            [commentId]
        )
    ).rows[0];
    return result.like_cnt;
};

const getCommentCommentCnt = async (commentId) => {
    const result = await (
        await pool.query(
            "SELECT COUNT(id) AS comment_cnt FROM text_comment WHERE parent_comment_id = $1",
            [commentId]
        )
    ).rows[0];
    return result.comment_cnt;
};

const commentIsLiked = async (commentId, userId) => {
    const results = await (
        await pool.query(
            "SELECT * FROM comment_like WHERE user_id = $1 AND comment_id = $2",
            [userId, commentId]
        )
    ).rows[0];
    console.log(results);
    if (results) {
        return true;
    } else {
        return false;
    }
};

const likeComment = async (userId, commentId) => {
    await pool.query(
        "INSERT INTO comment_like (user_id, comment_id) VALUES ($1, $2)",
        [userId, commentId]
    );
};

const unlikeComment = async (userId, commentId) => {
    await pool.query(
        "DELETE FROM comment_like WHERE user_id = $1 AND comment_id = $2",
        [userId, commentId]
    );
};

const getCommentLikesByUserId = async (userId) => {
    const results = await (
        await pool.query("SELECT * FROM comment_like WHERE user_id = $1", [
            userId,
        ])
    ).rows;
    console.log(results);
    return results;
};

const getTags = async () => {
    const results = await (
        await pool.query("SELECT * FROM post_tag ORDER BY name ASC")
    ).rows;
    return results;
};

const followUser = async (userId, userFollowingId) => {
    await pool.query(
        "INSERT INTO user_following (user_id, user_following_id) VALUES ($1, $2)",
        [userId, userFollowingId]
    );
};

const unfollowUser = async (userId, userFollowingId) => {
    await pool.query(
        "DELETE FROM user_following WHERE user_id = $1 AND user_following_id = $2",
        [userId, userFollowingId]
    );
};

const getFollowers = async (userId) => {
    const results = await (
        await pool.query(
            "SELECT * FROM user_following WHERE user_following_id = $1",
            [userId]
        )
    ).rows;
    return results;
};

const getFollowings = async (userId) => {
    const results = await (
        await pool.query("SELECT * FROM user_following WHERE user_id = $1", [
            userId,
        ])
    ).rows;
    return results;
};

const getFollowerCnt = async (userId) => {
    const results = await (
        await pool.query(
            "SELECT COUNT(user_id) AS follower_cnt FROM user_following WHERE user_following_id = $1",
            [userId]
        )
    ).rows[0];
    return parseInt(results.follower_cnt);
};

const getFollowingCnt = async (userId) => {
    const results = await (
        await pool.query(
            "SELECT COUNT(user_id) AS following_cnt FROM user_following WHERE user_id = $1",
            [userId]
        )
    ).rows[0];
    return parseInt(results.following_cnt);
};

module.exports = {
    users: {
        getUserByUsername,
        getUserById,
        insertNewUser,
        updateUserById,
        updateUserBio,
        updateName,
        updateUsername,
        updateSocialMedias,
        deleteUserById,
        updateUserSettingsByUserId,
        followUser,
        unfollowUser,
        getFollowers,
        getFollowings,
        getFollowerCnt,
        getFollowingCnt,
    },
    posts: {
        getPosts,
        getPostsById,
        getPostByUserId,
        insertNewPost,
        deletePostById,
        getTags,
        getPostIsLiked,
        searchPostText,
        likes: {
            likePost,
            unlikePost,
            getLikesByPostId,
            getLikesByUserId,
            getPostsLikesCnt,
        },
        comments: {
            insertNewComment,
            deleteCommentById,
            getCommentsByPostId,
            getCommentByCommentId,
            getCommentsByParentCommentId,
            getPostsCommentCnt,
            getCommentLikeCnt,
            likeComment,
            unlikeComment,
            getCommentLikesByUserId,
        },
    },
    logIn: {},
};
