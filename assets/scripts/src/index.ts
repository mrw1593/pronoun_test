// ------------------------------- CLASSES ------------------------------------

/**
 * A set of Pronouns
 */
class PronounSet {

	/** A name */
	public name: string;

	/** They/She/He */
	public subjective: string;

	/** Them/Her/Him */
	public objective: string;

	/** Their/Her/His */
	public possessiveDeterminer: string;

	/** Theirs/Hers/His */
	public possessivePronoun: string;

	/** Themself/Herself/Himself */
	public reflexive: string;

	/** Enby/Girl/Boy */
	public personType: string;

	public constructor(name: string,
	                   subjective: string,
					   objective: string,
					   possessiveDeterminer: string,
					   possessivePronoun: string,
					   reflexive: string,
					   personType: string,
					   public grammaticalNumber: boolean) {
		this.name = name.toLowerCase();
		this.subjective = subjective.toLowerCase();
		this.objective = objective.toLowerCase();
		this.possessiveDeterminer = possessiveDeterminer.toLowerCase();
		this.possessivePronoun = possessivePronoun.toLowerCase();
		this.reflexive = reflexive.toLowerCase();
		this.personType = personType.toLowerCase();
	}

	public getArticle(): string {
		if (this.grammaticalNumber) {
			return "are";
		} else {
			return "is";
		}
	}
}

class Story {

	private story: string;

	constructor(story: string) {
		this.story = story;
	}

	private static capitalize(str: string): string {
		const firstChar = str[0].toUpperCase();
		const stringRest = str.substring(1);
		return firstChar + stringRest;
	}

	public tellStory(pronouns: PronounSet): string {

		// Applies a filter to the string to tell the story
		// Automatically creates uppercase versions of each filter
		const applyFilter = (oldString: string, name: string,
		                     fn: (set: PronounSet) => string) =>
			oldString.replace(new RegExp(`{${name}}`, "g"), fn(pronouns))
			         .replace(new RegExp(`{${Story.capitalize(name)}}`, "g"),
					          Story.capitalize(fn(pronouns)));

		let nStory = applyFilter(this.story, "name", s => s.name);
		nStory = applyFilter(nStory, "subjective", s => s.subjective);
		nStory = applyFilter(nStory, "objective", s => s.objective);
		nStory = applyFilter(nStory, "possDet", s => s.possessiveDeterminer);
		nStory = applyFilter(nStory, "possPro", s => s.possessivePronoun);
		nStory = applyFilter(nStory, "reflexive", s => s.reflexive);
		nStory = applyFilter(nStory, "personType", s => s.personType);

		let start = 0;
		let end = 0;
		while (true) {
			start = nStory.indexOf('{');
			end = nStory.indexOf('}');

			if (start == -1 || end == -1) {break;}

			const choicesStr = nStory.substring(start, end + 1);
			const choices = nStory.substring(start + 1, end).split('/', 2);
			let choice : string;
			if (pronouns.grammaticalNumber) {
				choice = choices[1];
			} else {
				choice = choices[0];
			}
			nStory = nStory.replace(choicesStr, choice);
		}

		return nStory;
	}
}

// ------------------------------ CONSTANTS -----------------------------------

/**
 * Gets a random element of an array
 * @param list The list to grab an element from
 */
function randomElement<T>(list: Array<T>) : T {
	return list[Math.floor(Math.random() * list.length)];
}

const STORIES: string[] = [
	"Hey! This is my friend, {Name}. {Subjective} {is/are} a good {personType}. You better be nice to {objective} or {possDet} friend is gonna be real mad. Kidding! {Subjective} can look after {reflexive}. But now you gotta be nice to me, or else {Name} is gonna be mad. No, you can't be my best friend. I'm {possPro}!",
	"Have you seen that new {personType}? {PossDet} name is {Name}. {Subjective} {seems/seem} pretty cool. But {subjective} {is/are} not full of {reflexive}. We should go talk to {objective}. That desk over there is {possPro}. Let's go meet {objective}!",
	"{Name} got up this morning. {Subjective} brushed {possDet} teeth. It's good {subjective} {takes/take} care of {reflexive}. {PossDet} friends look after {subjective} too. Now {subjective} {wants/want} a shower. That shower is {possPro}. Time to get to work. This concludes our look at the coolest {personType} around.",
]

// Gender-neutral reflexive pronouns
const ENBY_REFLEXIVE: string[] = [
	"Themself", "Themselves", "Theirself", "Theirselves"
];

// Male reflexive pronouns
const MALE_REFLEXIVE: string[] = ["Himself", "Hisself"];

// ------------------------------- GLOBALS ------------------------------------

// The pronoun sets to use as hints
let DEFAULT_PRONOUN_SETS: PronounSet[] = [

	new PronounSet(
		"", "They", "Them", "Their", "Theirs",
		randomElement(ENBY_REFLEXIVE), "Enby", false
	),

	new PronounSet("", "She", "Her", "Her", "Hers", "Herself", "Girl", false),

	new PronounSet(
		"", "He", "Him", "His", "His",
		randomElement(MALE_REFLEXIVE), "Boy", false
	)
];

let storySection: HTMLElement; // shows a story

// the pronoun input
let nameInput: HTMLInputElement;
let subjective: HTMLInputElement;
let objective: HTMLInputElement;
let possessiveDeterminer: HTMLInputElement;
let possessivePronoun: HTMLInputElement;
let reflexive: HTMLInputElement;
let personType: HTMLInputElement;
let numericGrammar: NodeListOf<HTMLInputElement>;
let plural: HTMLInputElement;

// -------------------------- PRIVATE FUNCTIONS -------------------------------

/**
 * Returns a shuffle of an array
 * @param list The list to shuffle
 */
function shuffle<T>(list: Array<T>) {
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[list[i], list[j]] = [list[j], list[i]];
	}
}

function setInputElements() {
	const getElement = (id: string) => document.getElementById(id);
	storySection = getElement("story");
	nameInput = <HTMLInputElement>getElement("name");
	subjective = <HTMLInputElement>getElement("sub");
	objective = <HTMLInputElement>getElement("obj");
	possessiveDeterminer = <HTMLInputElement>getElement("pd");
	possessivePronoun = <HTMLInputElement>getElement("pp");
	reflexive = <HTMLInputElement>getElement("r");
	personType = <HTMLInputElement>getElement("ty");
	plural = <HTMLInputElement> getElement("plural");
}

function setPlaceholders() {
	// a string from the result of a function mapped on DEFAULT_PRONOUN_SET
	// all of the results are separated by slashes
	const insertSlashes = (func: (set: PronounSet) => string) =>
		DEFAULT_PRONOUN_SETS.map(func).join('/');

	// sets the placeholder of a text input box to the result of insertSlashes
	const setPlaceholder =
		(input: HTMLInputElement, func: (set: PronounSet) => string) =>
			input.placeholder = insertSlashes(func);

	// set placeholder hints
	setPlaceholder(subjective, e => e.subjective);
	setPlaceholder(objective, e => e.objective);
	setPlaceholder(possessiveDeterminer, e => e.possessiveDeterminer);
	setPlaceholder(possessivePronoun, e => e.possessivePronoun);
	setPlaceholder(reflexive, e => e.reflexive);
	setPlaceholder(personType, e => e.personType);
}

// --------------------------- PUBLIC FUNCTIONS -------------------------------

/**
 * Intializes the site
 */
function init() {
	setInputElements(); // get elements
	storySection.textContent = ""; // set story as blank
	shuffle(DEFAULT_PRONOUN_SETS); // shuffle the pronoun list
	setPlaceholders(); // set placeholder hints
}

function tellStory() {

	// get pronouns
	let pronouns = new PronounSet(
		nameInput.value,
		subjective.value,
		objective.value,
		possessiveDeterminer.value,
		possessivePronoun.value,
		reflexive.value,
		personType.value,
		plural.checked
	);

	let story = new Story(randomElement(STORIES));

	storySection.textContent = story.tellStory(pronouns);
}

function followMouse(event: MouseEvent) {
	let elements = document.getElementsByClassName("help");
	for (let i = 0; i < elements.length; i++) {
		let element = <HTMLElement> elements.item(i);
		element.style.left = scrollX + event.clientX + 10 + "px"
		element.style.top = scrollY + event.clientY + 10 + "px";
	}
}

document.onmousemove = followMouse;