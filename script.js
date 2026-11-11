const addBtn = document.getElementById("btn-addNote");
const container = document.getElementById("note-contain");

let notes = [];
let topZIndex = 1;

function createNote(id, content, x = 100, y = 100){
  const note = document.createElement("div");
  note.className = "note";
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  note.style.zIndex = ++topZIndex;

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

  // ---------- drag logic ----------
  let dragState = null;
  let frameId = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Dijalankan sekali per frame supaya gerakan tetap mulus (tidak membebani layout)
  function applyDragPosition() {
    frameId = null;
    if (!dragState) return;

    // Batas agar note tidak keluar dari papan
    const maxLeft = Math.max(0, container.clientWidth - note.offsetWidth);
    const maxTop = Math.max(0, container.clientHeight - note.offsetHeight);

    const left = clamp(
      dragState.startLeft + (dragState.pointerX - dragState.startX),
      0,
      maxLeft
    );
    const top = clamp(
      dragState.startTop + (dragState.pointerY - dragState.startY),
      0,
      maxTop
    );

    note.style.left = `${left}px`;
    note.style.top = `${top}px`;
  }

  function schedulePositionUpdate() {
    if (frameId === null) {
      frameId = requestAnimationFrame(applyDragPosition);
    }
  }

  function savePosition() {
    const data = notes.find((n) => n.id === id);
    if (data) {
      data.x = note.offsetLeft;
      data.y = note.offsetTop;
    }
  }

  function startDrag(e) {
    // Hanya klik kiri (mouse) yang boleh menggeser
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Jangan mulai drag dari textarea atau tombol hapus
    if (e.target.closest("textarea, .delete")) return;

    e.preventDefault();

    dragState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: note.offsetLeft,
      startTop: note.offsetTop,
      pointerX: e.clientX,
      pointerY: e.clientY,
    };

    note.classList.add("dragging");
    note.style.zIndex = ++topZIndex;
    note.setPointerCapture(e.pointerId);
  }

  function moveDrag(e) {
    if (!dragState || e.pointerId !== dragState.pointerId) return;

    // Simpan posisi pointer terakhir, render-nya ditunda ke frame berikutnya
    dragState.pointerX = e.clientX;
    dragState.pointerY = e.clientY;
    schedulePositionUpdate();
  }

  function stopDrag(pointerId) {
    if (!dragState) return;
    if (pointerId !== undefined && pointerId !== dragState.pointerId) return;

    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    applyDragPosition(); // pastikan posisi akhir tetap diterapkan

    const capturedId = dragState.pointerId;
    dragState = null;
    note.classList.remove("dragging");

    if (note.hasPointerCapture(capturedId)) {
      note.releasePointerCapture(capturedId);
    }

    savePosition();
  }

  note.addEventListener("pointerdown", startDrag);
  note.addEventListener("pointermove", moveDrag);
  note.addEventListener("pointerup", (e) => stopDrag(e.pointerId));
  note.addEventListener("pointercancel", (e) => stopDrag(e.pointerId));
  note.addEventListener("lostpointercapture", (e) => stopDrag(e.pointerId));

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