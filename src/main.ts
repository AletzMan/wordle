import "./style.css";

type CurrentWord = {
	letter: string;
	isCorrect: boolean;
	isPresent: boolean;
};

type NumberLetter = {
	letter: string;
	count: number;
};

const URL_API = "https://random-word-api.herokuapp.com/word?length=5&lang=es";

const testWord = [
	"capas",
	"callo",
	"arbol",
	"abril",
	"oirlo",
	"legal",
	"culto",
	"legua",
	"marea",
	"maria",
];

//let word = ["A", "B", "R", "I", "R"];
//let word = ["A", "R", "B", "O", "L"];
//let word = ["M", "A", "R", "E", "A"];
//let word = ["o", "i", "r", "l", "o"];
//let word = ["c", "u", "l", "t", "o"];
//et word = ["l", "e", "g", "a", "l"];
let word = ["c", "a", "p", "a", "s"];
let currentRow = 0;
let currentColumn = 0;
let currentWord: CurrentWord[] = [
	{ letter: "", isCorrect: false, isPresent: false },
	{ letter: "", isCorrect: false, isPresent: false },
	{ letter: "", isCorrect: false, isPresent: false },
	{ letter: "", isCorrect: false, isPresent: false },
	{ letter: "", isCorrect: false, isPresent: false },
];
let correctWords: string[] = [];
let numberLetter: NumberLetter[] = [];
let keys: NodeListOf<HTMLDivElement> | null = null;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="game"> 
    <div class="board"></div>
    <div class="message"></div>
    <div class="keyboard"></div>
  </div>
`;

const message = document.querySelector<HTMLDivElement>(".message") as HTMLDivElement;
const dialog = document.querySelector<HTMLDialogElement>(".dialog") as HTMLDialogElement;
const dialogWord = document.querySelector<HTMLSpanElement>(".dialog-word") as HTMLSpanElement;

const createKeyboard = () => {
	const keyboard = document.querySelector<HTMLDivElement>(".keyboard")!;
	const lettersQWERTY = [
		"Q",
		"W",
		"E",
		"R",
		"T",
		"Y",
		"U",
		"I",
		"O",
		"P",
		"A",
		"S",
		"D",
		"F",
		"G",
		"H",
		"J",
		"K",
		"L",
		"Ñ",
		"BACKSPACE",
		"Z",
		"X",
		"C",
		"V",
		"B",
		"N",
		"M",
		"ENTER",
	];
	if (!keyboard) return;
	let html = "";
	for (let i = 0; i < lettersQWERTY.length; i++) {
		if (lettersQWERTY[i] === "BACKSPACE") {
			html += `<div class="key key-special" id="key-backspace"> 
            <svg class="key-icon" width="500" height="500" viewBox="0 0 20 20">
                <path fill="#fff" d="M9.146 7.146a.5.5 0 0 1 .708 0L12 9.293l2.146-2.147a.5.5 0 0 1 .708.708L12.707 10l2.147 2.146a.5.5 0 0 1-.708.708L12 10.707l-2.146 2.147a.5.5 0 0 1-.708-.707L11.293 10L9.146 7.854a.5.5 0 0 1 0-.708m-2.56-2.482A2.5 2.5 0 0 1 8.283 4H15.5A2.5 2.5 0 0 1 18 6.5v7a2.5 2.5 0 0 1-2.5 2.5H8.283a2.5 2.5 0 0 1-1.697-.664l-3.787-3.5a2.5 2.5 0 0 1 0-3.672zM8.283 5a1.5 1.5 0 0 0-1.018.399l-3.787 3.5a1.5 1.5 0 0 0 0 2.203l3.787 3.5A1.5 1.5 0 0 0 8.283 15H15.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 15.5 5z"/></svg>
            </div>`;
		} else if (lettersQWERTY[i] === "ENTER") {
			html += `<div class="key key-special" id="key-enter">
            <svg class="key-icon" width="500" height="500" viewBox="0 0 24 24">
                <path fill="#fff" d="M19 6a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H7.41l1.3-1.29a1 1 0 0 0-1.42-1.42l-3 3a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l3 3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42L7.41 14H17a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1"/>
            </svg>
            </div>`;
		} else {
			html += `<div class="key" id="key-${lettersQWERTY[i].toLowerCase()}">${
				lettersQWERTY[i]
			}</div>`;
		}
	}
	keyboard.innerHTML = html;
	keys = document.querySelectorAll<HTMLDivElement>(".key") as NodeListOf<HTMLDivElement>;
};

const createBoard = () => {
	const board = document.querySelector<HTMLDivElement>(".board")!;
	if (!board) return;
	let html = "";
	for (let i = 0; i < 6; i++) {
		html += `
        <div class="row row-${i}">
            <div class="cell cell-0"></div>
            <div class="cell cell-1"></div>
            <div class="cell cell-2"></div>
            <div class="cell cell-3"></div>
            <div class="cell cell-4"></div>
        </div>`;
	}
	board.innerHTML = html;
};

const countLetters = (): NumberLetter[] => {
	let coutnLetter: NumberLetter[] = [];
	for (let i = 0; i < word.length; i++) {
		const letter = word[i];
		const index = coutnLetter.findIndex((l) => l.letter === letter);
		if (index === -1) {
			coutnLetter.push({ letter, count: 1 });
		} else {
			coutnLetter[index].count++;
		}
	}
	return coutnLetter;
};

const loadValidWords = async () => {
	const response = await fetch(
		`https://raw.githubusercontent.com/hermitdave/FrequencyWords/refs/heads/master/content/2018/es/es_50k.txt`
	);
	const data = await response.text();
	const words = data.split("\n");
	const onlyLetters = words.map((l) => l.replace(/\s\d+$/, ""));
	correctWords = [...onlyLetters];
	//selectWord();
};

function deleteAccent(word: string): string {
	return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const testSelectWord = () => {
	const index: number = Math.floor(Math.random() * testWord.length);
	const newWord = testWord[index];
	console.log("newWord", newWord);
	word = newWord.split("").map((l: string) => l.toLowerCase());
	console.log("word", word);
	numberLetter = [...countLetters()];
};

const selectWord = async () => {
	const response = await fetch(URL_API);
	const data: string[] = await response.json();
	const wordLowerCase = data[0].toLowerCase();
	const newWord: string = deleteAccent(wordLowerCase);
	word = newWord.split("").map((l: string) => l.toLowerCase());
	console.log("word", word);
	numberLetter = [...countLetters()];
};

const isWordValid = (): boolean => {
	if (correctWords.includes(currentWord.map((l) => l.letter).join(""))) {
		return true;
	}
	return false;
};

const markLetterSelected = (letter: string, type: "correct" | "present" | "wrong") => {
	const key = document.querySelector<HTMLDivElement>(`#key-${letter.toLowerCase()}`);
	if (!key) return;
	if (key.classList.contains(`key-correct`)) return;
	if (key.classList.contains(`key-present`) && key.textContent === letter.toUpperCase())
		key.classList.remove(`key-present`);
	key.classList.add(`key-${type}`);
};

const resetGame = (newGame: boolean = false) => {
	currentRow = 0;
	currentColumn = 0;
	currentWord = [
		{ letter: "", isCorrect: false, isPresent: false },
		{ letter: "", isCorrect: false, isPresent: false },
		{ letter: "", isCorrect: false, isPresent: false },
		{ letter: "", isCorrect: false, isPresent: false },
		{ letter: "", isCorrect: false, isPresent: false },
	];
	createBoard();
	if (newGame) {
		//selectWord();
		testSelectWord();
	}
	resetKeyboard();
	dialogWord.textContent = "";
};

const resetKeyboard = () => {
	keys!.forEach((key) => {
		key.classList.remove("key-correct", "key-present", "key-wrong");
	});
};

const showDialog = (message: string[], type: "win" | "lose") => {
	if (!dialog) return;
	dialog.classList.add("dialog-show");
	dialog.open = true;
	dialog.querySelector<HTMLDivElement>(".dialog-message")!.innerHTML = message.join("<br>");
	const button = dialog.querySelector<HTMLButtonElement>(".dialog-button")!;
	button.addEventListener("click", () => {
		dialog.close();
		dialog.open = false;
		dialog.classList.remove("dialog-show");
		resetGame(type === "win");
	});
	button.textContent = type === "win" ? "Jugar de nuevo" : "Intentar de nuevo";
};

const checkWord = () => {
	if (
		currentWord
			.map((l) => l.letter)
			.join("")
			.toLowerCase() === word.join("").toLowerCase()
	) {
		debugger;
		dialogWord.textContent = word.join("").toUpperCase();
		showDialog(["¡Felicidades!", "Adivinaste la palabra"], "win");
	} else if (currentRow === 5) {
		showDialog(["No has adivinado la palabra", "😥"], "lose");
	}
};
const checkLetter = () => {
	// Contar letras de la palabra objetivo (word)
	const letterCounts: Record<string, number> = {};
	for (const letter of word.join("").toLowerCase()) {
		letterCounts[letter] = (letterCounts[letter] || 0) + 1;
	}

	// Primera pasada: marcar las correctas (verde)
	for (let i = 0; i < currentWord.length; i++) {
		const cell = document.querySelector<HTMLDivElement>(`.row-${currentRow} .cell-${i}`);
		const guessedLetter = currentWord[i].letter.toLowerCase();

		if (guessedLetter === word[i].toLowerCase()) {
			currentWord[i].isCorrect = true;
			markLetterSelected(currentWord[i].letter, "correct");
			cell?.classList.add("letter-correct");
			letterCounts[guessedLetter]--; // Consumir una ocurrencia
		}
	}

	// Segunda pasada: marcar las presentes (amarillo) o incorrectas (gris)
	for (let i = 0; i < currentWord.length; i++) {
		const cell = document.querySelector<HTMLDivElement>(`.row-${currentRow} .cell-${i}`);
		const guessedLetter = currentWord[i].letter.toLowerCase();

		if (currentWord[i].isCorrect) continue; // Ya marcada como correcta

		if (word.includes(guessedLetter) && letterCounts[guessedLetter] > 0) {
			currentWord[i].isPresent = true;
			markLetterSelected(currentWord[i].letter, "present");
			cell?.classList.add("letter-present");
			letterCounts[guessedLetter]--; // Consumir una ocurrencia
		} else {
			markLetterSelected(currentWord[i].letter, "wrong");
			cell?.classList.add("letter-wrong");
		}
	}
};

loadValidWords();
createBoard();
createKeyboard();
resetGame(true);

keys!.forEach((key) => {
	key.addEventListener("click", () => {
		const letter = key.id.split("-")[1];
		if (!letter) return;
		if (letter === "backspace" && currentColumn > 0) {
			currentColumn--;
			const cell = document.querySelector<HTMLDivElement>(
				`.row-${currentRow} .cell-${currentColumn}`
			);
			if (!cell) return;
			cell.classList.remove("new-letter");
			cell.textContent = "";
			message!.textContent = "";
			currentWord[currentColumn].letter = "";
		} else if (letter === "enter") {
			if (currentColumn !== 5) return;
			if (!isWordValid()) {
				message!.textContent = "Palabra no valida";
				return;
			} else {
				checkWord();
				checkLetter();
				console.log("currentWord", currentWord);
				console.log("numberLetter", numberLetter);
			}
			const row = document.querySelector<HTMLDivElement>(`.row-${currentRow}`);
			if (!row) return;
			row.classList.add("row-added");
			currentRow++;
			currentColumn = 0;
			currentWord = [
				{ letter: "", isCorrect: false, isPresent: false },
				{ letter: "", isCorrect: false, isPresent: false },
				{ letter: "", isCorrect: false, isPresent: false },
				{ letter: "", isCorrect: false, isPresent: false },
				{ letter: "", isCorrect: false, isPresent: false },
			];
			numberLetter = [...countLetters()];
		} else {
			if (letter === "backspace") return;
			currentWord[currentColumn].letter = letter;
			const cell = document.querySelector<HTMLDivElement>(
				`.row-${currentRow} .cell-${currentColumn}`
			);
			if (!cell) return;
			cell.classList.add("new-letter");
			cell.textContent = letter.toUpperCase();
			currentColumn++;
		}
	});
});
