const info = require("debug")("db");
const pg = require("pg");
pg.types.setTypeParser(20, "text", parseInt);

const knex = require("knex")({
  client: "pg",
  connection: {
    connectionString: process.env.CONNECTION_STRING_PG,
    ssl: true,
  },
  pool: { min: 0, max: 5 },
});

const dbAddUser = async (username, pwdHash) => {
  const [userId] = await knex("users").insert({ login: username, passwordHash: pwdHash }, "userId");
  info(`User "${username}" add. Id = ${userId["userId"]}`);
  return userId["userId"];
};

const dbGetUserByName = async (username) => {
  const [user] = await knex("users").select().where({ login: username });
  info(user);
  if (!user) return null;
  return { userId: user.userId, username: user.login, password: user.passwordHash, isBlock: user.isBlock };
};

const dbGetUserBySession = async (sessionId) => {
  const [user] = await knex("session")
    .column({ userId: "users.userId", login: "users.login", isBlock: "users.isBlock" })
    .innerJoin("users", "users.userId", "session.userId")
    .where({ sessionId: sessionId });

  if (user) return { userId: user.userId, username: user.login, isBlock: user.isBlock };
  return null;
};

const dbAddSession = async (userId, sessionId) => {
  await knex("session").insert({ sessionId: sessionId, userId: userId });
};

const dbDeleteSession = async (sessionId) => {
  await knex("session").where({ sessionId: sessionId }).del();
};

/**
 *
 * @param {number} userId
 * @param {number} noteId
 * @returns any
 */
const dbGetNote = async (userId, noteId) => {
  const [note] = await knex("note").select().where({ userId: userId, noteId: noteId });
  info(`Search param [userId=${userId},noteId=${noteId}]. Result:`, note);
  return note || null;
};

/**
 *
 * @param {string} filter
 * @returns
 */
const filterByTitle = (filter) => {
  return (query) => query.andWhere(knex.raw("lower(title) like ?", [`%${filter}%`]));
};

/**
 *
 * @param {string} months
 * @returns
 */
const filterByCreated = (months) => {
  return (query) =>
    query
      .where(knex.raw(`created > NOW() - INTERVAL '${months} months'`))
      .andWhere(knex.raw(`("isArhiv" is null or "isArhiv" = false)`));
};

const filterIsArhive = () => {
  return (query) => query.where({ isArhiv: true });
};

const filterIsNotArhive = () => {
  return (query) => query.where(knex.raw(`("isArhiv" is null or "isArhiv" = false)`));
};

const filter1x1 = () => {
  return (query) => query.where(knex.raw("1=1"));
};

/**
 *
 * @param {number} userId
 * @param {string} age
 * @param {string} search
 * @param {number} page
 * @returns any
 */
const dbGetNotes = async (userId, age, search, page) => {
  let fCreated = filterIsNotArhive(),
    fSearch = filter1x1();
  let knotes = knex("note")
    .select()
    .orderBy("created", "desc")
    .limit(process.env.PAGE_SIZE)
    .offset(process.env.PAGE_SIZE * (page - 1))
    .where({ userId: userId });

  if (age === "1month") fCreated = filterByCreated(1);
  if (age === "3months") fCreated = filterByCreated(3);
  if (age === "archive") fCreated = filterIsArhive();

  if (search) fSearch = filterByTitle(search);

  const notes = fSearch(fCreated(knotes));

  info(notes.toString());

  return await notes;
};

/**
 *Обновляет заметку (заколовок и текст)
 *
 * @param {number} userId
 * @param {number} noteId
 * @param {string} title
 * @param {string} text
 * @returns
 */
const dbUpdateNote = async (userId, noteId, title, text) => {
  const ids = await knex("note")
    .where({ userId: userId, noteId: noteId })
    .update({ title: title, text: text }, ["noteId"]);
  info(`dbUpdateNote. Update param [userId=${userId},noteId=${noteId}]. Result:`, ids);
  return !!ids;
};

/**
 * Заметка помечается архивной
 *
 * @param {number} userId
 * @param {number} noteId
 * @param {boolean} isArhiv
 * @returns
 */
const dbNoteArh = async (userId, noteId, isArhiv) => {
  const ids = await knex("note").where({ userId: userId, noteId: noteId }).update({ isArhiv: isArhiv }, ["noteId"]);
  info(`dbNoteArh. Update param [userId=${userId},noteId=${noteId}]. Result:`, ids);
  return !!ids;
};

/**
 * Сохраняет в БД новую заметку
 *
 * @param {number} userId ЮзерИд
 * @param {string} title
 * @param {string} text
 * @returns { number }
 */
const dbNewNote = async (userId, title, text) => {
  info(`Add new note:\nUserId: ${userId}\nTitle: ${title}\nText: ${text}`);

  const [noteId] = await knex("note").insert(
    {
      userId: userId,
      title: title,
      text: text,
      created: knex.fn.now(),
    },
    "noteId"
  );
  info(`Note save. Id = ${noteId["noteId"]}`);
  return noteId["noteId"];
};

/**
 * Удаление заметки
 *
 * @param {number} userId
 * @param {number} noteId
 * @returns
 */
const dbNoteDeleteArh = async (userId, noteId) => {
  const ids = await knex("note").where({ userId: userId, noteId: noteId, isArhiv: true }).del("noteId");
  info(`dbNoteDeleteArh. delete param [userId=${userId},noteId=${noteId}]. Result:`, ids);
  return !!ids;
};

/**
 * Удаление всех архивных заметок пользователя
 *
 * @param {number} userId
 * @returns
 */
const dbNoteDeleteArhAll = async (userId) => {
  const ids = await knex("note").where({ userId: userId, isArhiv: true }).del();
  info(`dbNoteDeleteArh. delete param [userId=${userId}]. Result:`, ids);
  return !!ids;
};

//note functions
module.exports.dbNewNote = dbNewNote;
module.exports.dbGetNote = dbGetNote;
module.exports.dbUpdateNote = dbUpdateNote;
module.exports.dbGetNotes = dbGetNotes;
module.exports.dbNoteArh = dbNoteArh;
module.exports.dbNoteDeleteArhAll = dbNoteDeleteArhAll;
module.exports.dbNoteDeleteArh = dbNoteDeleteArh;

//user function
module.exports.dbAddSession = dbAddSession;
module.exports.dbDeleteSession = dbDeleteSession;
module.exports.dbAddUser = dbAddUser;
module.exports.dbGetUserByName = dbGetUserByName;
module.exports.dbGetUserBySession = dbGetUserBySession;
