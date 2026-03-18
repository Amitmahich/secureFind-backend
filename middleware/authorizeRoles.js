const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).send({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send({
          success: false,
          message: `Access denied for role: ${req.user.role}`,
        });
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in role authorization",
      });
    }
  };
};

module.exports = { authorizeRoles };
