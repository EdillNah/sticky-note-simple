const addBtn = document.getElementById("btn-addNote");
const container = document.getElementById("note-contain");

let notes = [];

function createNote(id, content, x = 100, y = 100){
  const note = document.createElement("div");
  note.className = "note";
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;

  //create textarea
  const textarea = document.createElement("textarea");
  textarea.value = content;
  
  //create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete";
  deleteBtn.innerHTML = "x";
  
  //create move button
  const moveBtn = document.createElement("div");
  moveBtn.className = "move-icon";
  moveBtn.innerHTML = "=";
  
  //append elements to note
  note.appendChild(textarea);
  note.appendChild(deleteBtn);
  note.appendChild(moveBtn);
  container.appendChild(note);

  //move button listener
  let offsetX, offsetY;
  note.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "TEXTAREA") return;

    const startX = e.clientX - note.offsetLeft;
    offsetY = e.offsetY;

    function onMouseMove(e) {
      note.style.left = `${e.pageX - offsetX}px`;
      note.style.top = `${e.pageY - offsetY}px`;
    }

    function onMouseUp() {
      const noteIndex = notes.findIndex(n => n.id === id);
      notes[noteIndex].x = parseInt(note.style.left);
      notes[noteIndex].y = parseInt(note.style.top);

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  //close button listener
  deleteBtn.addEventListener("click", () => {
    container.removeChild(note);
    notes = notes.filter((n) => n.id !== id);
  });

  //update note content listener
  textarea.addEventListener("input", () => {
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
      notes[noteIndex].content = textarea.value;
    }
  });

}

//click listener
addBtn.addEventListener("click", () => {
  const newNote = {
    id: Date.now(),
    content: "",
    x: 100,
    y: 100,
  };
  notes.push(newNote);
  createNote(newNote.id, newNote.content, newNote.x, newNote.y);
});