const books = [];
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
  if (typeof Storage === 'undefined') {
    alert('Browser tidak mendukung local storage');
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  return books.find((bookItem) => bookItem.id === bookId);
}

function findBookIndex(bookId) {
  return books.findIndex((bookItem) => bookItem.id === bookId);
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement('p');
  bookYear.innerText = `Tahun: ${year}`;

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action');

  const moveButton = document.createElement('button');
  moveButton.innerText = isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
  moveButton.classList.add(isComplete ? 'green' : 'green');
  moveButton.addEventListener('click', function () {
    moveBook(id, !isComplete);
  });

  const deleteButton = document.createElement('button');
  deleteButton.innerText = 'Hapus buku';
  deleteButton.classList.add('red');
  deleteButton.addEventListener('click', function () {
    deleteBook(id);
  });

  actionContainer.append(moveButton, deleteButton);

  const bookContainer = document.createElement('article');
  bookContainer.classList.add('book_item');
  bookContainer.append(bookTitle, bookAuthor, bookYear, actionContainer);

  return bookContainer;
}

function addBook(title, author, year, isComplete) {
  const generatedID = generateId();
  const Year = parseInt(year, 10);
  const bookObject = generateBookObject(generatedID, title, author, Year, isComplete);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveBook(bookId, isComplete) {
  const bookTarget = findBook(bookId);
  if (bookTarget === undefined) return;

  bookTarget.isComplete = isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;

  books.splice(bookTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBooks(keyword) {
  const searchResult = books.filter((book) => {
    const lowerTitle = book.title.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    return lowerTitle.includes(lowerKeyword);
  });

  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: searchResult }));
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchForm = document.getElementById('searchBook');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    addBook(title, author, year, isComplete);
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value;
    searchBooks(searchTitle);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function (event) {
  const unCompleted = document.getElementById('incompleteBookshelfList');
  const listCompleted = document.getElementById('completeBookshelfList');

  unCompleted.innerHTML = '';
  listCompleted.innerHTML = '';

  const booksToRender = event.detail || books;

  for (const bookItem of booksToRender) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      unCompleted.append(bookElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const serialized = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, serialized);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books.push(...data);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
