const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  console.log('verifyToken middleware called');
  const token = req.headers['authorization']?.split(' ')[1]
  console.log('Authorization header:', req.headers['authorization']);
  if (!token) return res.status(403).send({ message: 'Token manquant.' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Token invalide.' })
    console.log('verifyToken decoded:', decoded);
    req.user = decoded;
    next()
  })
}
