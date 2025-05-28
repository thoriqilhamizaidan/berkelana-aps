module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }
    // Example token validation
    if (token !== 'valid-token') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    next();
  };
  
