exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied. You are not allowed to perform this action.",
      });
    }

    next();
  };
};