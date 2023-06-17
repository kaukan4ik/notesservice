const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const httpError = require("http-errors");
const {
  getNote,
  getNotes,
  newNote,
  updateNote,
  deleteAllArhiveNotes,
  deleteArhiveNote,
  arhiveNote,
  unarhiveNote,
  getNotePdf,
} = require("../services/note");
const express = require("express");
const note = express.Router();
const info = require("debug")("app");
const pdf = require("markdown-pdf");
const querystring = require("querystring");

//создадим новою
note.post("/new", async (req, res) => {
  const { title, text } = req.body;
  if (!title && !text) throw httpError(HTTP_NOT_FOUND, "title, text is empty");
  const noteId = await newNote(req.user.userId, title, text);
  return res.status(HTTP_OK).json({ _id: noteId });
});

//вернем по id
note.get("/:id", async (req, res) => {
  const note = await getNote(req.user.userId, req.params["id"]);
  if (!note) throw httpError(HTTP_NOT_FOUND, `Note id=[${req.params["id"]}] not found`);
  return res.status(HTTP_OK).json(note);
});

//вернем по id pdf
note.get("/:id/pdf", async (req, res) => {
  const note = await getNotePdf(req.user.userId, req.params["id"]);
  if (!note) throw httpError(HTTP_NOT_FOUND, `Note id=[${req.params["id"]}] not found`);
  const filename = `note_${encodeURI(note.title)}.pdf`;
  info(`Download ${filename}`);
  res.setHeader("Content-disposition", `attachment;filename="${filename}"`);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Description", "File Transfer");
  res.setHeader("Pragma", "public");

  pdf()
    .from.string(`*${note.created}*\n# ${note.title}\n\n\n${note.text}`)
    .to.buffer(null, (err, buff) => {
      return res.status(HTTP_OK).send(buff);
    });
});

//вермнем по запросу
note.get("/", async (req, res) => {
  info("get:", req.query);
  const { age, search, page } = req.query;
  info("get:", search);
  const notes = await getNotes(req.user.userId, age || "1month", search || "", page || 1);
  return res.status(HTTP_OK).json(notes);
});

//сохранение заметки с идентификатором id
note.put("/:id/update", async (req, res) => {
  const { title, text } = req.body;
  if (!title && !text) throw httpError(400, "title or text is empty");
  const status = await updateNote(req.user.userId, req.params["id"], title, text);
  if (!status) throw httpError(HTTP_NOT_FOUND, `Note id=[${req.params["id"]}] not found`);
  return res.status(HTTP_OK).json({ message: "successful" });
});

//отправим в архивные
note.put("/:id/arh", async (req, res) => {
  const status = await arhiveNote(req.user.userId, req.params["id"]);
  if (!status) throw httpError(HTTP_NOT_FOUND, `Note id=[${req.params["id"]}] not found`);
  return res.status(HTTP_OK).json({ message: "successful" });
});

//вернем из архива
note.put("/:id/unarh", async (req, res) => {
  const status = await unarhiveNote(req.user.userId, req.params["id"]);
  if (!status) throw httpError(HTTP_NOT_FOUND, `Note id=[${req.params["id"]}] not found`);
  return res.status(HTTP_OK).json({ message: "successful" });
});

//удалаяем
note.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const status =
    id === "all" ? await deleteAllArhiveNotes(req.user.userId) : await deleteArhiveNote(req.user.userId, id);
  if (!status) throw httpError(HTTP_NOT_FOUND, `Note id=[${req.params["id"]}] not found`);
  return res.status(HTTP_OK).json({ message: "successful" });
});

module.exports = note;
