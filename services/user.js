const { dbAddSession, dbAddUser, dbGetUserByName, dbDeleteSession, dbGetUserBySession} = require("./pg/pg");
const { nanoid } = require("nanoid");
const hash = require("../services/hash");

const createUserSession = async (userId) => {
  const sessionId = nanoid();
  dbAddSession(userId, sessionId);
  return sessionId;
};

const existsUser = async (userName) => {
  let user = await dbGetUserByName(userName);
  if (user) return true;
  return false;
};


const deleteSession = async (sessionId) => {
  dbDeleteSession(sessionId);
};


const getUserBySession = async (sessionId) => {
  let user = await dbGetUserBySession(sessionId);
  if (user) return user;
  return null;
};

const getUser = async (username, password) => {
  let user = await dbGetUserByName(username);
  if (user && user.password === hash(password)) return user;
  return null;
};


const newUser = async (username, password) => {
  const userId = await dbAddUser(username, hash(password));
  return userId;
};

module.exports.createUserSession = createUserSession;


module.exports.deleteSession = deleteSession;
module.exports.getUserBySession = getUserBySession;
module.exports.existsUser = existsUser;
module.exports.newUser = newUser;
module.exports.getUser = getUser;
