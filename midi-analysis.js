const analysisContainer = document.querySelector('.analysis');

class Node {
  constructor(children, Note) {
    this.children = children;
    this.Note = Note;
  }
}

const analyseNotes = function (notes) {
  findArpeggios(notes);
  findMotifs(notes);
  findChords(notes);
};

const findArpeggios = function (notes) {
  const arpeggios = [];
  for (let i = 0; i < notes.length - 2; i++) {
    const isThird =
      (Math.abs(notes[i + 1].note - notes[i].note) === 4 ||
        Math.abs(notes[i + 1].note - notes[i].note) === 3) &&
      Math.abs(notes[i + 1].startTime - notes[i].startTime) > 3;
    const isFifth =
      Math.abs(notes[i + 2].note - notes[i].note) == 7 &&
      Math.abs(notes[i + 2].startTime - notes[i].startTime > 3);
    if (isThird && isFifth) {
      arpeggios.push([i, i + 1, i + 2]);
      console.log(
        `Apreggio Detected at ${notes[i].id}, ${notes[i + 1].id}, ${
          notes[i + 2].id
        }`
      );
      i += 2;
    }
  }
  arpeggios.forEach((arpeggio) =>
    drawAnalysis(arpeggio, 'Arpeggio', notesContainer.children)
  );
};

const findMotifs = function (notes) {
  let motifQueue;
  // const visitedNotes = [];
  for (let k = 0; k < notes.length; k++) {
    // if (visitedNotes.includes(notes[k].note)) {
    //   continue;
    // }
    // visitedNotes.push(notes[k].note);

    const root = new Node([], notes[k]);
    let current = root;
    counter = 0;
    for (let i = k + 1; i < notes.length; i++) {
      if (notes[i].note === notes[k].note) {
        current = root;
        if (counter >= 3) {
          motifsQueue = [];
          for (l = 0; l <= counter; l++) {
            motifsQueue.push(k + l);
          }
          drawAnalysis(motifsQueue, 'Motif', notesContainer.children);
          motifsQueue = [];
          for (l = 0; l <= counter; l++) {
            motifsQueue.push(i - l - 1);
          }
          drawAnalysis(motifsQueue, 'Motif', notesContainer.children);
          console.log(`motif found at index: ${k} to ${k + counter}`);
          console.log(`motif found at index: ${i - counter - 1} to ${i - 1}`);
          k += counter;
        }
        counter = 0;
      } else if (
        !current.children.find((node) => node.Note.note === notes[i].note)
      ) {
        if (counter >= 3) {
          motifsQueue = [];
          for (l = 0; l <= counter; l++) {
            motifsQueue.push(k + l);
          }
          drawAnalysis(motifsQueue, 'Motif', notesContainer.children);
          motifsQueue = [];
          for (l = 0; l <= counter; l++) {
            motifsQueue.push(i - l - 1);
          }
          drawAnalysis(motifsQueue, 'Motif', notesContainer.children);
          console.log(`motif found at index: ${k} to ${k + counter}`);
          console.log(`motif found at index: ${i - counter - 1} to ${i - 1}`);
          k += counter;
        }
        counter = 0;
        current.children.push(new Node([], notes[i]));
        current = current.children[current.children.length - 1];
      } else if (
        current.children.find((node) => node.Note.note === notes[i].note)
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
      motifsQueue = [];
      for (l = 0; l <= counter; l++) {
        motifsQueue.push(k + l);
      }
      drawAnalysis(motifsQueue, 'Motif', notesContainer.children);
      motifsQueue = [];
      for (l = 0; l <= counter; l++) {
        motifsQueue.push(notes.length - l - 1);
      }
      drawAnalysis(motifsQueue, 'Motif', notesContainer.children);
      console.log(`motif found at index: ${k} to ${k + counter}`);
      console.log(
        `motif found at index: ${notes.length - counter - 1} to ${
          notes.length - 1
        }`
      );
      k += counter;
    }
  }
};

const findChords = function (notes) {
  const chords = [];
  for (let i = 0; i < notes.length - 2; i++) {
    const isThird =
      (Math.abs(notes[i + 1].note - notes[i].note) === 4 ||
        Math.abs(notes[i + 1].note - notes[i].note) === 3) &&
      Math.abs(notes[i + 1].startTime - notes[i].startTime) < 3;
    const isFifth =
      Math.abs(notes[i + 2].note - notes[i].note) == 7 &&
      Math.abs(notes[i + 2].startTime - notes[i].startTime < 3);
    if (isThird && isFifth) {
      chords.push([i, i + 1, i + 2]);
      console.log(
        `Chord Detected at ${notes[i].id}, ${notes[i + 1].id}, ${
          notes[i + 2].id
        }`
      );
      i += 2;
      chords.forEach((chord) =>
        drawAnalysis(chord, 'Chord', notesContainer.children)
      );
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
    console.log(highLeft);
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
