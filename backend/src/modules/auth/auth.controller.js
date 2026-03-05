import * as AuthService from "./auth.service.js";
import { isValidEmail,isValidUsername,isValidPassword } from "../../utils/validation.js";

export const register = async (req, res) => {
  try {
    let { username, email, password, confirmPassword  } = req.body;

    // Required fields
    if ( !email || !password || !confirmPassword ) {
      return res.status(400).json({
        message: "Username, email, password and confirm password are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    // username = username.trim();
    email = email.trim().toLowerCase();
    // username validation
    // if (!isValidUsername(username)) {
    //   return res.status(400).json({
    //     message: "Username must be between 3 and 20 characters"
    //   });
    // }
    // Email validation using utils
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const user = await AuthService.registerUser({
      username,
      email,
      password
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,  
        email: user.email,
      },
      message: "User registered successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await AuthService.loginUser(req.body);
    res.status(200).json({success: true, data:data, message: "Login successful"});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};