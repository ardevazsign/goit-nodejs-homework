import express from "express";
import { ctrlWrapper } from "../../helpers/ctrlWrapper.js";
// prettier-ignore
import { signupUser, loginUser, logoutUser, getCurrentUser, updateUserSubscription, updateAvatar } from "../../controllers/usersController.js";
import { authenticateToken } from "../../middlewares/authenticateToken.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();

// POST: // http://localhost:3000/api/users/signup
// {
//   "email": "newojunior@gmail.com",
//     "password": "passwordsample"
// }
router.post("/signup", ctrlWrapper(signupUser));

//  POST: // http://localhost:3000/api/users/login
// {
//   "email": "newojunior@gmail.com",
//     "password": "passwordsample"
// }
router.post("/login", ctrlWrapper(loginUser));

//  GET: // http://localhost:3000/api/users/logout
router.get("/logout", authenticateToken, ctrlWrapper(logoutUser));

//  GET: //  http://localhost:3000/api/users/current
router.get("/current", authenticateToken, ctrlWrapper(getCurrentUser));

//  PATCH: // http://localhost:3000/api/users
router.patch("/", authenticateToken, ctrlWrapper(updateUserSubscription));

// PATCH: // http://localhost:3000/api/users/avatars
// form-data
// updateAvatar, file: image

// prettier-ignore
router.patch("/avatars", authenticateToken, upload.single("avatar"), ctrlWrapper(updateAvatar));

export { router };
