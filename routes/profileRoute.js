const express = require("express");
const passport = require("passport");
const profileRouter = express.Router();
const userProfileController = require("../controllers/userProfileController");
const { authenticateToken } = require("../utils");
const postController = require("../controllers/postsController");

profileRouter.use(passport.authenticate("jwt", { session: false }));

profileRouter.get("/", async (req, res) => {
    const user = await req.user;
    res.json(user)
});

profileRouter.get(
    "/public/:userId",
    userProfileController.getProfileDataById
);

profileRouter.get("/myLikes", userProfileController.getLikesByUserId);

profileRouter.get(
    "/comments/myLikes",
    userProfileController.getCommentLikesByUserId
);

profileRouter.post("/follow/:userId", userProfileController.followUser);

profileRouter.delete("/unfollow/:userId", userProfileController.unfollowUser);

profileRouter.get("/followers", userProfileController.getFollowers);

profileRouter.get("/followings", userProfileController.getFollowings);

profileRouter.get("/followerCnt", userProfileController.getFollowerCnt);

profileRouter.get("/followingCnt", userProfileController.getFollowingCnt);

// profileRouter.get("/:username", userProfileController.getProfileByUsername);

profileRouter.patch("/bio", userProfileController.updateBio);

profileRouter.patch("/name", userProfileController.updateName);

profileRouter.patch("/username", userProfileController.updateUsername);

profileRouter.patch("/socialMedias", userProfileController.updateSocialMedias);

//need to log user out then delete user
profileRouter.delete("/", userProfileController.deleteProfileById);

module.exports = profileRouter;
