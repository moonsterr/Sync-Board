import query from './dbQuery';
import bcrypt from 'bcrypt';

export const createUser = async ({ username, password, email }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username,email`,
    [username, hashedPassword, email]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0];
};

export const comparePasswords = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
