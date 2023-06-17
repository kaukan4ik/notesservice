//const { nanoid } = require("nanoid");
const {
  dbNewNote,
  dbGetNote,
  dbGetNotes,
  dbUpdateNote,
  dbNoteArh,
  dbNoteDeleteArh,
  dbNoteDeleteArhAll,
} = require("./pg/pg");
const md = require("markdown-it")();

function prepareNotes(note) {
  note._id = note.noteId;
  delete note.noteId;
  delete note.userId;
  note.html = md.render(note.text);
  note.text;
}

const newNote = async (userId, title, text) => {
  return await dbNewNote(userId, title, text);
};
const getNotePdf = async (userId, noteId) => {
  let note = await dbGetNote(userId, noteId);
  if (note) prepareNotes(note);
  return note;
};
const getNote = async (userId, noteId) => {
  let note = await dbGetNote(userId, noteId);
  if (note) prepareNotes(note);
  return note;
};
const getNotes = async (userId, age, search, page) => {
  const notes = await dbGetNotes(userId, age, search.toLowerCase(), page);
  if (notes) {
    notes.map((note) => {
      prepareNotes(note);
      //подсветка найденного слова
      if (search) {
        const rex = new RegExp(`(${search})`, "ig");
        note.highlights = note.title.replace(rex, "<mark>$1</mark>");
      }
    });
    return { data: notes, hasMore: !!notes.length };
  }
  return null;
};
const updateNote = async (userId, noteId, title, text) => {
  return await dbUpdateNote(userId, noteId, title, text);
};

const deleteAllArhiveNotes = async (userId) => {
  return await dbNoteDeleteArhAll(userId);
};
const deleteArhiveNote = async (userId, noteId) => {
  return await dbNoteDeleteArh(userId, noteId);
};
const arhiveNote = async (userId, noteId) => {
  return await dbNoteArh(userId, noteId, true);
};
const unarhiveNote = async (userId, noteId) => {
  return await dbNoteArh(userId, noteId, false);
};

module.exports.deleteAllArhiveNotes = deleteAllArhiveNotes;
module.exports.deleteArhiveNote = deleteArhiveNote;
module.exports.arhiveNote = arhiveNote;
module.exports.unarhiveNote = unarhiveNote;
module.exports.newNote = newNote;
module.exports.getNote = getNote;
module.exports.getNotePdf = getNotePdf;
module.exports.getNotes = getNotes;
module.exports.updateNote = updateNote;
