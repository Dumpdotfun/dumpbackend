import { NextFunction, Request, Response, request } from "express";
import jwt from 'jsonwebtoken';
import Joi from "joi";
import crypto from "crypto";
import base58 from "bs58";
import nacl from "tweetnacl";
import { JWT_SECRET, SIGN_IN_MSG } from "../config/constants";
import { AuthRequest } from "../middleware/authorization";
import NonceUsers from "../models/NonceUsers";
import UserModel from "../models/User";



// User sign-in controller
export const userSignIn = async (req: Request, res: Response) => {
  const { body } = req;
  console.log("signIn--body-->", req.body)
  // Define the Joi validation schema
  const UserSchema = Joi.object({
    wallet: Joi.string().required(),
  });

  try {
    // Validate input asynchronously
    await UserSchema.validateAsync(body);
  } catch (validationError) {
    return res.status(400).json({ error: validationError.details[0].message });
  }

  const wallet = body.wallet;

  try {
    // Check if user already exists in the main User collection
    const existingUser = await UserModel.findOne({ wallet });
    if (existingUser) {
      // Generate JWT Token for the existing user
      const token = jwt.sign(
        { id: existingUser._id, wallet: existingUser.wallet },
        JWT_SECRET,
        { expiresIn: "1h" } // Token expires in 1 hour
      );

      return res.status(200).json({ data: { name: existingUser.name, wallet: existingUser.wallet, avatar: existingUser.avatar, following: existingUser.following, followers: existingUser.followers, token, bio: existingUser.bio }, signIn: true }); // Return user data and token
    }

    // Check if user already exists in the NonceUsers collection
    const checkUser = await NonceUsers.findOne({ wallet });
    if (checkUser) {
      return res
        .status(400)
        .json({ message: "A user with this wallet already requested." });
    }

    // Generate nonce for new user
    const nonce = crypto.randomBytes(8).toString("hex");

    // Save new User in the NonceUsers collection
    const newUser = new NonceUsers({
      wallet,
      nonce,
    });
    const nonceUser = await newUser.save();

    // Respond with the newly created nonce user
    return res.status(200).json({ data: { nonce: nonceUser.nonce, wallet: nonceUser.wallet }, signIn: false });

  } catch (error) {
    console.error("Error occurred during user creation:", error.message);
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
};

// User sign-up controller
export const userSignUp = async (req: Request, res: Response) => {
  // Extract body parameters
  const { wallet, signature, nonce } = req.body;

  // Construct the request body to validate
  const body = {
    wallet,
    signature,
    nonce,
  };

  // Define validation schema
  const UserSchema = Joi.object({
    wallet: Joi.string().required(),
    nonce: Joi.string().required(),
    signature: Joi.string().required(),
  });

  // Validate user input
  const { error } = UserSchema.validate(body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Find and delete the pending user by nonce
    const foundNonce = await NonceUsers.findOneAndDelete({ nonce }).exec();
    if (!foundNonce) {
      return res.status(400).json({ error: "Your request has expired." });
    }

    const signatureUint8 = base58.decode(signature);
    const msgUint8 = new TextEncoder().encode(`${SIGN_IN_MSG}:${foundNonce.nonce}`);
    const pubKeyUint8 = base58.decode(wallet);

    const isValidSignature = nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);

    if (!isValidSignature) {
      return res.status(401).json({ error: "Invalid signature." });
    }

    // If all checks pass, create and save the new user
    const userData = {
      name: body.wallet.slice(0, 5),
      wallet: body.wallet,
    };

    const newUser = new UserModel(userData);
    const savedUser = await newUser.save();

    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: savedUser._id, wallet: savedUser.wallet }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Return the new user info along with the JWT token
    return res.status(200).json({ data: { name: savedUser.name, wallet: savedUser.wallet, avatar: savedUser.avatar, following: savedUser.following, followers: savedUser.followers, token, bio: savedUser.bio} });
  } catch (error) {
    console.error("Error occurred during user creation:", error.message);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};

// Update user profile controller
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { body } = req;
  console.log("updateProfile--->", body)
  // Define the Joi validation schema
  const UserSchema = Joi.object({
    name: Joi.string().required(),
    avatar: Joi.string().required(),
    wallet: Joi.string().required(),
    followers: Joi.number().required(),
    following: Joi.number().required(),
    bio: Joi.string().required(),
  });

  try {
    // Validate input asynchronously
    await UserSchema.validateAsync(body);
  } catch (validationError) {
    console.log("Validate Error")
    return res.status(400).json({ error: validationError.details[0].message });
  }

  const wallet = body.wallet;
  try {
    console.log(wallet)
    const updatedUser = await UserModel.findOneAndUpdate(
      { wallet },
      { $set: body },
      { new: true, runValidators: true }
    );
    console.log("UpdatedUser-->", updatedUser)
    // Handle case when user is not found
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send successful response with updated user data
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    // Log server errors for debugging
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "An internal server error occurred" });
  }
}

export const fetchUserProfile = async (req :Request, res: Response)=> {
  try {
    const userAddress = req.params.userAddress;
    const userProfile = await UserModel.findOne({wallet: userAddress});
    return res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({error:"An internal server error occurred"})
  }
}