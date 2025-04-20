const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
  console.log('--- [verifyToken] ---');
  console.log('Requête:', req.method, req.path);
  console.log('Authorization header:', req.headers['authorization']);
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('Token manquant. Headers complets:', JSON.stringify(req.headers));
    return res.status(403).send({ message: 'Token manquant.' });
  }

  // Affiche le début du token pour debug (jamais tout !)
  console.log('Token reçu (début):', token.slice(0, 15) + '...');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token invalide:', err);
      return res.status(401).send({ message: 'Token invalide.', error: err.message });
    }
    // Log l'expiration si présente
    if (decoded && decoded.exp) {
      const expDate = new Date(decoded.exp * 1000);
      console.log('Token décodé. Expiration:', expDate.toISOString());
    } else {
      console.log('Token décodé:', decoded);
    }
    req.user = decoded;
    next();
  });
}
