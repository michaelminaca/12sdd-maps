const analysisContainer = document.querySelector('.analysis');

class Node {
  constructor(children, Note, index) {
    this.children = children;
    this.Note = Note;
    this.index = index;
  }
}

const analyseNotes = function (notes) {
  analysisContainer.innerHTML = '';
  findArpeggios(notes);
  findMotifs(notes);
  findChords(notes);
};

const findArpeggios2 = function (notes) {
  let arpeggio = [];
  for (let i = 0; i < notes.length - 2; i++) {
    const isThird =
      (Math.abs(notes[i + 1].note - notes[i].note) === 4 ||
        Math.abs(notes[i + 1].note - notes[i].note) === 3) &&
      Math.abs(notes[i + 1].startTime - notes[i].startTime) > 3;
    const isFifth =
      Math.abs(notes[i + 2].note - notes[i].note) == 7 &&
      Math.abs(notes[i + 2].startTime - notes[i].startTime > 3);
    if (isThird && isFifth) {
      arpeggio.push(notes[i].id, notes[i + 1].id, notes[i + 2].id);
      drawAnalysis(arpeggio, 'Arpeggio', notesContainer.children);
      i += 2;
      arpeggio = [];
    }
  }
};

const findArpeggios = function (notes) {
  if (notes.length > 2) {
    let arpeggio = [];
    let counter = 0;
    for (let i = 0; i < notes.length; i++) {
      if (
        notes[i + 1] &&
        Math.abs(notes[i].startTime - notes[i + 1].startTime) >= 5 &&
        (Math.abs(notes[i + 1].note - notes[i].note) === 4 ||
          Math.abs(notes[i + 1].note - notes[i].note) === 3 ||
          Math.abs(notes[i + 1].note - notes[i].note) == 7)
      ) {
        counter++;
      } else {
        if (counter > 1) {
          for (j = 0; j <= counter; j++) {
            arpeggio.push(notes[i - j].id);
          }
          drawAnalysis(arpeggio, 'Arpeggio', notesContainer.children);
          arpeggio = [];
        }
        counter = 0;
      }
    }
  }
};

const findMotifs = function (notes) {
  let motifQueue = [];
  const visitedNotes = [];
  for (let k = 0; k < notes.length; k++) {
    if (visitedNotes.includes(k)) {
      continue;
    }
    visitedNotes.push(k);
    const root = new Node([], notes[k], k);
    let current = root;
    let counter = 0;
    for (let i = k + 1; i < notes.length; i++) {
      if (notes[i].note === notes[k].note) {
        if (counter >= 3) {
          motifQueue = [];
          for (l = 0; l <= counter; l++) {
            motifQueue.push(notes[current.index - l].id);
            visitedNotes.push(current.index - l);
          }
          drawAnalysis(motifQueue, 'Motif', notesContainer.children);
          motifQueue = [];
          for (l = 0; l <= counter; l++) {
            motifQueue.push(notes[i - l - 1].id);
          }
          drawAnalysis(motifQueue, 'Motif', notesContainer.children);
          k += counter;
        }
        counter = 0;
        current = root;
      } else if (
        current.children.find((node) => node.Note.note === notes[i].note) ===
        undefined
      ) {
        if (counter >= 3) {
          motifQueue = [];
          for (l = 0; l <= counter; l++) {
            motifQueue.push(notes[current.index - l].id);
            visitedNotes.push(current.index - l);
          }
          drawAnalysis(motifQueue, 'Motif', notesContainer.children);
          motifQueue = [];
          for (l = 0; l <= counter; l++) {
            motifQueue.push(notes[i - l - 1].id);
          }
          drawAnalysis(motifQueue, 'Motif', notesContainer.children);
          k += counter;
        }
        counter = 0;
        current.children.push(new Node([], notes[i], i));
        current = current.children[current.children.length - 1];
      } else if (
        current.children.find((node) => node.Note.note === notes[i].note) !==
        undefined
      ) {
        counter++;
        for (let j = 0; j < current.children.length; j++) {
          if (current.children[j].Note.note === notes[i].note) {
            current = current.children[j];
          }
        }
      }
    }
    if (counter >= 3) {
      motifQueue = [];
      for (l = 0; l <= counter; l++) {
        motifQueue.push(notes[current.index - l].id);
        visitedNotes.push(current.index - l);
      }
      drawAnalysis(motifQueue, 'Motif', notesContainer.children);
      motifQueue = [];
      for (l = 0; l <= counter; l++) {
        motifQueue.push(notes[notes.length - l - 1].id);
      }
      drawAnalysis(motifQueue, 'Motif', notesContainer.children);
      k += counter;
    }
  }
};

const findChords = function (notes) {
  if (notes.length > 2) {
    let chord = [];
    let counter = 0;
    for (let i = 0; i < notes.length; i++) {
      if (
        notes[i + 1] &&
        Math.abs(notes[i].startTime - notes[i + 1].startTime) < 5
      ) {
        counter++;
      } else {
        if (counter > 1) {
          for (j = 0; j < counter; j++) {
            chord.push(notes[i - j].id);
          }
          drawAnalysis(chord, 'Chord', notesContainer.children);
          chord = [];
        }
        counter = 0;
      }
    }
  }
};

const findDrawnNoteElements = function (analyseNotesIDs, drawnNotes) {
  const correctDrawnNoteElements = [];
  const drawnNotesArray = Array.from(drawnNotes);
  analyseNotesIDs.forEach((noteID) => {
    drawnNotesArray.forEach((drawnNote) => {
      if (noteID == drawnNote.dataset.id)
        correctDrawnNoteElements.push(drawnNote);
    });
  });
  return correctDrawnNoteElements;
};

const findDimensionsOfAnalysisElement = function (analysisNoteElements) {
  let highLeft =
      parseFloat(analysisNoteElements[0].style.left) +
      parseFloat(analysisNoteElements[0].style.width),
    highTop = parseFloat(analysisNoteElements[0].style.top),
    curLeft = parseFloat(analysisNoteElements[0].style.left),
    curTop = parseFloat(analysisNoteElements[0].style.top);
  for (let i = 1; i < analysisNoteElements.length; i++) {
    if (parseFloat(analysisNoteElements[i].style.top) < curTop)
      curTop = parseFloat(analysisNoteElements[i].style.top);
    if (parseFloat(analysisNoteElements[i].style.left) < curLeft)
      curLeft = parseFloat(analysisNoteElements[i].style.left);
    if (
      parseFloat(analysisNoteElements[i].style.left) +
        parseFloat(analysisNoteElements[i].style.width) >
      highLeft
    )
      highLeft =
        parseFloat(analysisNoteElements[i].style.left) +
        parseFloat(analysisNoteElements[i].style.width);
    if (parseFloat(analysisNoteElements[i].style.top) > highTop)
      highTop = parseFloat(analysisNoteElements[i].style.top);
  }
  highLeft = highLeft - curLeft;
  highTop = highTop + 90 / 61 - curTop;
  return [
    `${highLeft + 2}vw`,
    `${highTop + 2}vh`,
    `${curLeft - 1}vw`,
    `${curTop - 1}vh`,
  ];
};

const drawAnalysis = function (analysisNotesID, title, drawnNotes) {
  const analysisNoteElements = findDrawnNoteElements(
    analysisNotesID,
    drawnNotes
  );
  const dimensions = findDimensionsOfAnalysisElement(analysisNoteElements);
  const html = document.createElement('div');
  html.classList.add('note-analysis');
  html.style.width = dimensions[0];
  html.style.height = dimensions[1];
  html.style.left = dimensions[2];
  html.style.top = dimensions[3];
  const text = document.createElement('p');
  text.textContent = title;
  text.classList.add('analysis-text');
  html.appendChild(text);
  analysisContainer.appendChild(html);
};
