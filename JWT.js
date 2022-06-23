const jwt = require('jsonwebtoken');
const JWP_SECRET = process.env.JWP_SECRET;

const { sign, verify } = require("jsonwebtoken");

const createTokens = (user) => {
  const roles = Object.values(user.roles);
  const accessToken = sign(
    { name: user.name, id: user._id, roles:roles },
    JWP_SECRET,
  );

  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];

  if (!accessToken)
    return res.status(400).json({ error: "User not Authenticated!" });

  try {
    const validToken = verify(accessToken, JWP_SECRET,(err,decoded)=>{
      if(err) return res.status(400).json({ error:err});
      req.authenticated = true;
      req.mainUsername = decoded.name;
      req.roles = decoded.roles;
      next();
    });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
      if (!req?.roles) return res.sendStatus(401).json({ error: "one" });
      const rolesArray = [...allowedRoles];
      const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);
      if (!result) return res.sendStatus(401).json({ error: "two" });
      next();
  }
}

module.exports = { createTokens, validateToken, verifyRoles };