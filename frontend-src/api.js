const PREFIX = "http://localhost:3000/api/";

const req = (url, options = {}) => {
  const { body } = options;

  return fetch((PREFIX + url).replace(/\/\/$/, ""), {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
            "Content-Type": "application/json",
          }
        : null),
    },
  }).then((res) =>
    res.ok
      ? res.json()
      : res.text().then((message) => {
          throw new Error(message);
        })
  );
};

export const getNotes = ({ age, search, page } = {}) => {
  return req(`notes?age=${age}&search=${search}&page=${page}`);
};

export const createNote = (title, text) => {
  return req("notes/new", {
    method: "post",
    body: {
      title: title,
      text: text,
    },
  });
};

export const getNote = (id) => {
  return req(`notes/${id}`);
};

export const archiveNote = (id) => {
  return req(`notes/${id}/arh`, {
    method: "put",
  });
};

export const unarchiveNote = (id) => {
  return req(`notes/${id}/unarh`, {
    method: "put",
  });
};

export const editNote = (id, title, text) => {
  return req(`notes/${id}/update`, {
    method: "put",
    body: {
      title: title,
      text: text,
    },
  });
};

export const deleteNote = (id) => {
  return req(`notes/${id}`, {
    method: "delete",
  });
};

export const deleteAllArchived = () => {
  return req("notes/all", {
    method: "delete",
  });
};

export const notePdfUrl = (id) => {
  return `${PREFIX}/notes/${id}/pdf`;
};
