const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
    authenticateToken,
    authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
                        REGISTER
============================================================ */

router.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {

            return res.status(400).json({

                success: false,

                message: "Please fill all fields."

            });

        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({

                success: false,

                message: "User already exists."

            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({

            username,

            email,

            password: hashedPassword,

            role: "user"

        });

        await user.save();

        res.status(201).json({

            success: true,

            message: "Registration successful."

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});
/* ============================================================
                        LOGIN
============================================================ */

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Please enter email and password."

            });

        }

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({

                success: false,

                message: "User not found."

            });

        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {

            return res.status(400).json({

                success: false,

                message: "Invalid password."

            });

        }

        const token = jwt.sign(

            {

                id: user._id,

                username: user.username,

                role: user.role,

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "1h",

            }

        );

        res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            username: user.username,

            email: user.email,

            role: user.role,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

});
/* ============================================================
                        USER PROFILE
============================================================ */

router.get(
    "/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const user = await User.findById(req.user.id)
                .select("-password");

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            res.status(200).json({

                success: true,

                user

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);

/* ============================================================
                    ADMIN DASHBOARD
============================================================ */

router.get(
    "/admin",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            res.status(200).json({

                success: true,

                message: "Welcome Admin!",

                admin: {

                    id: req.user.id,

                    username: req.user.username,

                    role: req.user.role

                }

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);
/* ============================================================
                    DASHBOARD STATISTICS
============================================================ */

router.get(
    "/stats",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const totalUsers = await User.countDocuments();

            const totalAdmins = await User.countDocuments({
                role: "admin"
            });

            const totalNormalUsers = await User.countDocuments({
                role: "user"
            });

            res.status(200).json({

                success: true,

                totalUsers,

                totalAdmins,

                totalNormalUsers

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);
/* ============================================================
                    GET ALL USERS
============================================================ */

router.get(
    "/users",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const users = await User.find()
                .select("-password")
                .sort({
                    createdAt: -1
                });

            res.status(200).json({

                success: true,

                totalUsers: users.length,

                users

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);
/* ============================================================
                    UPDATE USER ROLE
============================================================ */

router.patch(
    "/users/:id/role",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            const { role } = req.body;

            if (!["admin", "user"].includes(role)) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid role."

                });

            }

            if (req.user.id === req.params.id && role === "user") {

                return res.status(400).json({

                    success: false,

                    message: "You cannot remove your own admin role."

                });

            }

            const updatedUser = await User.findByIdAndUpdate(

                req.params.id,

                {
                    role
                },

                {
                    new: true
                }

            ).select("-password");

            if (!updatedUser) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            res.status(200).json({

                success: true,

                message: "Role updated successfully.",

                user: updatedUser

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);
/* ============================================================
                    DELETE USER
============================================================ */

router.delete(
    "/users/:id",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {

        try {

            if (req.user.id === req.params.id) {

                return res.status(400).json({

                    success: false,

                    message: "You cannot delete your own account."

                });

            }

            const deletedUser = await User.findByIdAndDelete(req.params.id);

            if (!deletedUser) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            res.status(200).json({

                success: true,

                message: "User deleted successfully."

            });

        }

        catch (err) {

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }
);

module.exports = router;