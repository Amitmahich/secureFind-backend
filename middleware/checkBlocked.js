const checkBlocked = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
module.exports = {checkBlocked};
