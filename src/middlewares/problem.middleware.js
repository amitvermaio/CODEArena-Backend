export const problemMiddleware = (req, res, next) => {
  const secret = req.headers["x-secret-key"];
  
  if (!secret || secret!==process.env.SECRET_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  next();
};
