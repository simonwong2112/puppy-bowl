// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2605-SIMON"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let puppies = [];
let selectedPuppy;

/** Updates state with all puppies from the API */
async function getPuppies() {
  try {
    const response = await fetch(API + "/players");
    const result = await response.json();
    //console.log(result);
    puppies = result.data.players;
    //console.log(puppies);
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getPuppy(id) {
  try {
    const response = await fetch(API + "/players/" + id);
    const result = await response.json();
    selectedPuppy = result.data.player; //Changed players to player.
    render();
  } catch (e) {
    console.error(e);
  }
}

//FIX
async function addPuppy(puppy) {
  try {
    await fetch(API + "/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(puppy),
    });
    await getPuppies();
  } catch (e) {
    console.error(e);
  }
}

async function removePuppy(id) {
  try {
    await fetch(API + "/players/" + id, {
      method: "DELETE",
    });

    selectedPuppy = undefined;
    await getPuppies();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the puppy when clicked */
function PuppyListItem(puppy) {
  const $li = document.createElement("li");

  if (puppy.id === selectedPuppy?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${puppy.name}
     <img src="${puppy.imageUrl}" alt="${puppy.name}">
    ${puppy.name}</a>
  `;
  $li.addEventListener("click", () => getPuppy(puppy.id));
  return $li;
}

/** A list of names of all puppies */
function PuppyList(puppyArray) {
  //console.log(puppyArray);
  const $ul = document.createElement("ul");
  $ul.classList.add("lineup");

  const $puppies = puppyArray.map(PuppyListItem);
  $ul.replaceChildren(...$puppies);

  return $ul;
}

/** Detailed information about the selected puppy */
function SelectedPuppy() {
  if (!selectedPuppy) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a puppy to learn more.";
    return $p;
  }

  const $puppy = document.createElement("section");
  $puppy.classList.add("puppy");
  $puppy.innerHTML = `
    <puppyId>${selectedPuppy.id}</puppyId>
    <h3>${selectedPuppy.name} #${selectedPuppy.id}</h3>
    <breed>${selectedPuppy.breed}</breed>
    <status>${selectedPuppy.status}</status>
    <team>${selectedPuppy.team?.name ?? "Unassigned"}</team>
    
    <img src=${selectedPuppy.imageUrl}
  alt=${selectedPuppy.name}>
  <button>Remove from roster</button>
    
  `; //<teamID></teamID> place above if can figure out

  const $delete = $puppy.querySelector("button");
  $delete.addEventListener("click", () => removePuppy(selectedPuppy.id));

  return $puppy;
}

function NewPuppyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
  <label>
    Name
    <input name="name" required />
  </label>

  <label>
    Breed
    <input name="breed" required />
  </label>

  <button>Add Puppy</button>

  `;
  // Event listener to make party. Sticking with the mandatory name and breed for now
  const puppyButton = $form.querySelector("button");
  $form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData($form);

    const puppy = {
      name: data.get("name"),
      breed: data.get("breed"),
    };

    await addPuppy(puppy);
  });
  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Puppy Bowl</h1>
    <main>
      <section>
        <h2>Puppies</h2>
        <PuppyList></PuppyList>
      </section>
      <section id="selected">
        <h2>Puppy Details</h2>
        <SelectedPuppy></SelectedPuppy>
      </section>
      <section>
  <h2>Add a Puppy</h2>
  <NewPuppyForm></NewPuppyForm>
</section>
    </main>
  `;

  $app.querySelector("PuppyList").replaceWith(PuppyList(puppies));
  $app.querySelector("SelectedPuppy").replaceWith(SelectedPuppy());
  $app.querySelector("NewPuppyForm").replaceWith(NewPuppyForm());
}

async function init() {
  await getPuppies();

  render();
}

init();
