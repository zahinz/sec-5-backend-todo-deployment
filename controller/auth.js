import jwt from "jsonwebtoken";
import pool from "../database/connection.js";
import bcrypt from "bcrypt";

import { decrypt, encrypt } from "../utils/encyption.js";

export async function register(req, res) {
  try {
    const reqBody = req.body;

    // check if email, username and password are provided
    if (!reqBody.email || !reqBody.username || !reqBody.password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // create hash of password
    // 10 means 2 power of 10 rounds of hashing
    // 2^10 = 1024 rounds of hashing 150ms
    // 2^11 = 2048 rounds of hashing 300ms
    // 2^12 = 4096 rounds of hashing, quadruples the time taken to hash 10 times 600ms
    // the best practice is to use 10 rounds of hashing
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reqBody.password, salt);

    // encrypt email by using node js core module crypto
    const encryptedUsername = encrypt(reqBody.username);
    const encryptedEmail = encrypt(reqBody.email);

    // create new user in database
    // query is always a string, dynamic values are passed as an array with the $ sign
    const query = `
      INSERT INTO "Users" (username, email, "password")
      VALUES($1, $2, $3);
      `;
    // change req.body.password to hashedPassword
    // const values = [reqBody.username, reqBody.email, reqBody.password];
    const values = [encryptedUsername, encryptedEmail, hashedPassword];
    await pool.query(query, values);
    const apiResponse = {
      message: "User created successfully",
    };
    res.status(200).json(apiResponse);
  } catch (error) {
    //   why 500? because it is a server error due to promise rejection by the database connection pool
    res.status(500).json(error);
  }
}

export async function login(req, res) {
  try {
    const reqBody = req.body;
    const encryptedEmail = encrypt(reqBody.email);
    // check if email exists in database
    const query = `
        SELECT * FROM "Users"
        WHERE email=$1;
        `;
    const values = [encryptedEmail];
    const response = await pool.query(query, values);
    // if email not found, return 404
    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // if email found, check if password matches
    // check the match by using bcrypt.compare()

    // compare using string password
    // if (reqBody.password !== response.rows[0].password) {
    //   return res.status(401).json({ message: "Password incorrect" });
    // }

    // compare using hashed password
    const isPasswordCorrect = await bcrypt.compare(
      reqBody.password,
      response.rows[0].password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    // decrypt username
    const decryptedUsername = decrypt(response.rows[0].username);
    const decryptedEmail = decrypt(response.rows[0].email);

    // if password matches, create a token using jsonwebtoken
    const userData = {
      id: response.rows[0].id,
      username: decryptedUsername,
      email: decryptedEmail,
    };
    const token = jwt.sign(userData, "superDuperSecret");

    // if password matches, return user object
    const apiResponse = {
      message: "Login successful",
      user: {
        id: response.rows[0].id,
        username: decryptedUsername,
        email: decryptedEmail,
      },
      token: token,
    };
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json(error);
  }
}

// list all users
// secured routes
// route : GET /users

// get user by id
// secured routes
// route : GET /users/:id

// update user by id
// secured routes and only the user can update their own data
// route : PUT /users/:id

// delete user by id
// secured routes and only the user can delete their own data
// route : DELETE /users/:id
