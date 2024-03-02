import express from 'express';
import User from '../models/user.model.js';
import { loginController } from '../controller/user.controller.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';

const router = express.Router();

router.get('/mycomments', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'comments',
      select: '-__v -_id',
      populate: {
        path: 'author',
        select: '-_id name lastName username',
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (username && email) {
      return res
        .status(400)
        .json({ message: 'Only one of username or email is required' });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (user && comparePassword(password, user.password)) {
      const loggedUser = {
        uid: user._id,
        username: user.username,
        email: user.email,
      };

      const token = await createToken(loggedUser);

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: loggedUser,
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
