import {
  createUser,
  findUserByEmail,
  comparePasswords,
} from '../services/userService';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const alreadyUser = findUserByEmail(req.body.email);
    if (alreadyUser) {
      res.status(409).send({ success: false, data: 'already exists' });
    }
    const user = await createUser(req.body);
    res.status(201).send({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, data: error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);
    if (!user) return res.status(401).send({ success: false, data: 'invalid' });
    const compare = comparePasswords(password, user.password);
    if (!compare)
      return res.status(401).send({ success: false, data: 'invalid' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.status(200).send({ success: true, data: token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false, data: err });
  }
};
