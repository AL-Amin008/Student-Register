const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key'; // Replace with your actual secret key

function authVerifyMiddleware(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user information to the request for further use
    next(); // Proceed to the next middleware or route handler
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = authVerifyMiddleware;
