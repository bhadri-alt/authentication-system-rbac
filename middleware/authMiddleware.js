const jwt = require("jsonwebtoken");

/* ===========================
   VERIFY JWT TOKEN
=========================== */

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({

            success: false,

            message: "Access denied. No token provided."

        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({

            success: false,

            message: "Invalid or expired token."

        });

    }

};

/* ===========================
   ROLE AUTHORIZATION
=========================== */

const authorizeRoles = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized."

            });

        }

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "Access denied. Insufficient permissions."

            });

        }

        next();

    };

};

module.exports = {

    authenticateToken,

    authorizeRoles,

};