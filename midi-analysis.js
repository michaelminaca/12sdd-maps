class Node {
  constructor(children, Note) {
    this.children = children;
    this.Note = Note;
  }
}

const analyseNotes = function (notes) {
  findArpeggios(notes);
  findMotifs(notes);
};

const findArpeggios = function (notes) {
  const arpeggios = [];
  for (let i = 0; i < notes.length - 2; i++) {
    const isThird =
      notes[i + 1].note - notes[i].note === 4 ||
      notes[i + 1].note - notes[i].note === 3 ||
      notes[i + 1].note - notes[i].note === -4 ||
      notes[i + 1].note - notes[i].note === -3;
    const isFifth =
      notes[i + 2].note - notes[i].note == 7 ||
      notes[i + 2].note - notes[i].note == -7;
    if (isThird && isFifth) {
      arpeggios.push([notes[i].id, notes[i + 1].id, notes[i + 2].id]);
      console.log(
        `Apreggio Detected at ${notes[i].id}, ${notes[i + 1].id}, ${
          notes[i + 2].id
        }`
      );
      i += 2;
    }
  }
};

const findMotifs = function (notes) {
  const motifs = [];
  const visitedNotes = [];
  for (let k = 0; k < notes.length; k++) {
    if (visitedNotes.includes(notes[k].note)) {
      continue;
    }
    visitedNotes.push(notes[k].note);

    const root = new Node([], notes[k]);
    let current = root;
    counter = 0;
    for (let i = k + 1; i < notes.length; i++) {
      if (notes[i].note === notes[k].note) {
        current = root;
        if (counter >= 3) {
          console.log(`motif found at index: ${i - counter - 1} to ${i - 1}`);
          k += counter;
        }
        counter = 0;
      } else if (
        !current.children.find((node) => node.Note.note === notes[i].note)
      ) {
        if (counter >= 3) {
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
      console.log(
        `motif found at index: ${notes.length - counter - 1} to ${
          notes.length - 1
        }`
      );
      k += counter;
    }
  }
};
