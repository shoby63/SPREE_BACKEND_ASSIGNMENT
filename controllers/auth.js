// import { Snowflake } from "@theinternetfolks/snowflake"
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
exports.postSignup = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const id = uuidv4();
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      id,
      name,
      email,
      password: hashedPassword,
    });
     // Create an object for JWT payload
    const encryptuser = {
      id: id,
      email: email,
      name: name,
      password: req.body.password,
    };
    // const accessToken = jwt.sign(encryptuser, process.env.SECRET_KEY, {
    //   expiresIn: "1h",
    // });
    // Prepare the response payload
    const responsePayload = {
      status: true,
      content: {
        data: {
          id: id,
          name: name,
          email: email,
          password: req.body.password,
        },
        meta: {
          access_token: "Please Signin to get access token",
        },
      },
    };
    // Send the response
    // Save the user to the database
    const savedUser = await newUser.save();
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error("User creation failed:", err);
    return res.status(500).json({
      status: false,
      message: "User creation failed",
    });
  }
};

exports.postSignin =  (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .exec()
    .then((user) => {
      if (!user) {
        console.log("User not found");
        return res
          .status(200)
          .json({ status: false, message: "User does not exist" ,user});
      } else {
        bcrypt
          .compare(password,user?.password)
          .then((result) => {
            if (result) {
              const encryptuser = {
                id: user?.id,
                email: user?.email,
                name:user?.name,
              };
              const accessToken = jwt.sign(
                encryptuser,
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
              );
              const responsePayload = {
                status: true,
                content: {
                  data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password:password,
                    created_at: user.created_at,
                  },
                  meta: {
                    access_token: accessToken, // Replace with the actual access token
                  },
                },
              };
              
              return res.status(200).json(responsePayload);
            } else {
              console.log("Password is incorrect");
              return res
                .status(401)
                .json({ message: "Authentication failed, Bad Credentials" });
            }
          })
          .catch((err) => {
            console.error("Password comparison failed:", err);
            //   res.redirect('/v1/auth/signin');
          });
      }
    })
    .catch((error) => {
      console.error("User lookup failed:", error);
      return res.status().json({ message: "try again" });
    });
};
exports.getDetails = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized: Missing token" });
  }

  jwt.verify(
    token.replace("Bearer ", ""),
    process.env.SECRET_KEY,
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      } else {
       
        User.findOne( {id:user?.id}).exec()
          .then((result) => {
            const payload = {
              status: true,
              content: {
                data: {
                  id: result.id,
                  name: result.name,
                  email: result.email,
                  created_at: result.created_at,
                },
              },
            };
            return res.status(200).json(payload);
          })
          .catch((err) => {
            return res
              .status(400)
              .json({ status: false, message: "Request Failed","error_message":err });
          });
      }
    }
  );
};
