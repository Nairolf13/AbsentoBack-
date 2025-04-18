const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  console.log('--- [verifyToken] ---');
  console.log('Authorization header:', req.headers['authorization']);
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('Token manquant.');
    return res.status(403).send({ message: 'Token manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token invalide:', err);
      return res.status(401).send({ message: 'Token invalide.' });
    }
    console.log('Token décodé:', decoded);
    req.user = decoded;
    next();
  });
}
