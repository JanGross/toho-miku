const ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;

function isAuthorized(req, res = null) {
  const providedToken = req.headers['apikey'];
  if (providedToken !== ACCESS_TOKEN) {
    if (res) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    return false;
  }

  return true;
}

module.exports = { isAuthorized };