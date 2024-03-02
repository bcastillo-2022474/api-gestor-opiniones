import express from 'express';
import User from '../models/user.model.js';
import { loginController } from '../controller/user.controller.js';
import { hashPassword, comparePassword } from '../helpers/bcrypt.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';

const router = express.Router();

router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -posts -comments -__v'
    );

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/comments', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'comments',
      select: '-__v -_id',
      populate: {
        path: 'author',
        select: '-_id name lastName username',
      },
    });

    res.json(user.comments);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/posts', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'posts',
      select: '-__v',
      populate: {
        path: 'author',
        select: '-_id name lastName username',
      },
    });

    res.json(user.posts);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, lastName, email, username, password } = req.body;

    const user = new User({
      name,
      lastName,
      email,
      username,
      password: await hashPassword(password),
      posts: [],
      comments: [],
    });

    await user.save();

    res.json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

router.put('/update', isLoggedIn, async (req, res) => {
  try {
    const { name, lastName, email, username } = req.body;
    const user = req.user;

    user.name = name;
    user.lastName = lastName;
    user.email = email;
    user.username = username;

    let usernameAlreadyExists = await User.findOne({ username });
    let emailAlreadyExists = await User.findOne({ email });

    if (
      usernameAlreadyExists &&
      usernameAlreadyExists._id.toString() !== user._id.toString()
    ) {
      return res.status(400).json({ message: 'Username already exists' });
    } else if (
      emailAlreadyExists &&
      emailAlreadyExists._id.toString() !== user._id.toString()
    ) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await user.save();

    res.json({ message: 'User updated' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/update/password', isLoggedIn, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    const isPasswordCorrect = await comparePassword(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

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
