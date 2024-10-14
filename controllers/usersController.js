import { User } from "../models/usersModel.js";
import gravatar from "gravatar";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import { Jimp } from "jimp";
import path from "path";
import {
  signupValidation,
  subscriptionValidation,
} from "../validations/validation.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { httpError } from "../helpers/httpError.js";

const { SECRET_KEY } = process.env;

// Signup validation
const signupUser = async (req, res) => {
  const { email, password } = req.body;

  // Registration validation error
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
    // res
    //   .status(400)
    //   .json({ message: "missing required  email or password field" });
  }
  // Registeration conflict error
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  // Create a link to the user's avatar with gravatar
  const avatarURL = gravatar.url(email, { protocol: "http" });

  const newUser = await User.create({
    email,
    password: hashPassword,
    avatarURL,
  });

  //  Registration success response
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
  // By Mam Radh
  // try {
  //   //  we have to make sure the email is unique
  //   //  we need to used findOne(query) to verify that the email is not yet existing
  //   const { email, password } = req.body;

  //   const existingUser = await User.findOne({ email });
  //   // Registration conflict error
  //   if (existingUser) {
  //     return res.status(409).json({ message: "Email is already used" });
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const newUser = await User.create({
  //     email: email,
  //     password: hashedPassword,
  //   });
  //   res.status(201).json({
  //     user: {
  //       email: newUser.email,
  //       password: newUser.password,
  //     },
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
};
// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Login Validation error
  const { error } = signupValidation.validate(req.body);
  if (error) {
    throw httpError(401, error.message);
    // res
    //   .status(400)
    //   .json({ message: "missing required  email or password field" });
  }

  // Login auth error (email)
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, "Email or password is wrong");
  }

  // Login auth error (password)
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw httpError(401, "Email or password is wrong");
  }

  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  // Login success response
  res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
  //   By mam Radh
  // try {
  //   const { email, password } = req.body;

  //   const existingUser = await User.findOne({ email });

  //   if (!existingUser) {
  //     return res.status(401).json({ message: "Email or password is wrong" });
  //   }

  //   const isPasswordValid = await bcrypt.compare(
  //     password,
  //     existingUser.password
  //   );

  //   if (!existingUser) {
  //     return res.status(401).json({
  //       message: "Email or password is wrong",
  //     });
  //   }
  //   if (!isPasswordValid) {
  //     return res.status(401).json({
  //       message: "Password is wrong. Click forgot password is wrong",
  //     });
  //   }
  //   //
  //   const payload = { id: existingUser._id };
  //   const token = jwt.sign(payload, SECRETE_KEY, { expiresIn: "23h" });

  //   await User.findByIdAndUpdate(existingUser._id, { token: token });
  //   res.status(200).json({
  //     token: token,
  //     user: {
  //       email: existingUser.email,
  //     },
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
};

// Logout
const logoutUser = async (req, res) => {
  const { _id } = req.user;

  // Logout unauthorized error (setting token to empty string will remove token -> will logout)
  await User.findByIdAndUpdate(_id, { token: "" });

  // Logout success response
  res.status(204).send();
};

//  GetCurrentUser
const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateUserSubscription = async (req, res) => {
  const { error } = subscriptionValidation.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const { _id } = req.user;

  const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });

  res.json({
    email: updatedUser.email,
    subscription: updatedUser.subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, originalname } = req.file;

  await Jimp.read(oldPath).then((image) =>
    // image.resize(250, 250).write(oldPath)
    image.cover(250, 250).write(oldPath)
  );

  const extension = path.extname(originalname);

  const filename = `${_id}${extension}`;
  const newPath = path.join("public", "avatars", filename);
  await fs.rename(oldPath, newPath);

  let avatarURL = path.join("/avatars", filename);
  avatarURL = avatarURL.replace(/\\/g, "/");

  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};

// prettier-ignore
export { signupUser, loginUser, logoutUser, getCurrentUser, updateUserSubscription, updateAvatar };
// Cryptography bcrypt Hashing hash compare
// install bcrypt
