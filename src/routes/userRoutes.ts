import express from "express";
import { fetchUserProfile, updateProfile, userSignIn, userSignUp } from "../controller/userController";

const userRoutes = express.Router();

// User sign-in route
userRoutes.post('/sign-in', async (req, res, next) => {
  try {
    await userSignIn(req, res);
  } catch (error) {
    next(error);
  }
});

// User sign-up route
userRoutes.post('/sign-up', async (req, res, next) => {
  try {
    await userSignUp(req, res);
  } catch (error) {
    next(error);
  }
});
// User profile update route
userRoutes.post('/updateProfile', async (req, res, next) => {
  try {
    await updateProfile(req, res);
  } catch (error) {
    next(error);
  }
})

//User profile fetch route
userRoutes.get('/:userAddress', async (req, res, next) => {
  try {
    await fetchUserProfile(req, res);
  } catch (error) {

  }
})

export default userRoutes;
