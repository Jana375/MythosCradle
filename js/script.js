//Thank up pop up message 
//Get link to form 

let contactForm = document.forms['contactForm'];

//Add listener for the callback 
if (contactForm) {
    contactForm.addEventListener("submit", getFormInfo);
}

//Extract the form data into an object 
function getFormInfo(event) {
    //Denying of placeholder text
    event.preventDefault();

    //Create the object which will store the form data
    let formData = {
        "name": this['name'].value,
        "email": this['email'].value,
        "subject": this['subject'].value,
        "message": this['message'].value
    };

    //Write the data to a variable for innerHTML 

    let output =`
    <h3>Thank you for submitting, ${formData["name"]}</h3>
    `;

     //Select the HTML section that we want to update

    let outSection = document.querySelector(".outputContainer");

    //Populate bootstrap modal and show

    outSection.innerHTML = output; 

    //Show the bootstrap 
    //get the corresponding HTML element 
    let contactModal = new bootstrap.Modal(document.getElementById("contactModal"));

    contactModal.show();
}


//Search bar 
//Array
const creatures = [
    { name: "Blue Dragon - Azuron", id: "azuron" },
    { name: "Kitsune - Yuki", id: "yuki" },
    { name: "Griffin - Aurelia", id: "aurelia" },
    { name: "Water Wisp - Lumina", id: "lumina" },
    { name: "Pegasus - Star wind", id: "starwind" },
    { name: "Forest Spirit - Briar", id: "briar" }
]
//Function to initialize searchbar 
function initSearchBar() {
    const searchInput = document.querySelector(".searchBar input");
    const searchBarContainer = document.querySelector(".searchBar");

    if (!searchInput || !searchBarContainer) return; 

    //Create dropdown element
    const dropdown = document.createElement("ul"); 
    dropdown.className = "searchDropdown";
    searchBarContainer.appendChild(dropdown);

    //See if inside pages folder
    const isPagesFolder = window.location.pathname.includes("/pages/");

    //Capture search input
    function handleSearchInput(e) {
        const query = e.target.value.toLowerCase().trim();
        dropdown.innerHTML = "";

        //Test for input
        if (query === "") {
            dropdown.style.display = "none";
            return;
        }

        //Filter elements matching query
        function matchesQuery(c){
            return c.name.toLowerCase().includes(query);
        }
        const filtered = creatures.filter(matchesQuery);

        if (filtered.length > 0){
            filtered.forEach(addCreature);
            dropdown.style.display = "block";
        } else {
            //no creature found
            const noResultHTML = document.createElement("li");
            noResultHTML.textContent = "No Creatures found";
            noResultHTML.style.color = "#999";
            noResultHTML.style.cursor = "default";
            dropdown.appendChild(noResultHTML);
            dropdown.style.display = "block";
        }
    }

    function addCreature(creature){
        const li = document.createElement("li");
        li.textContent = creature.name;

        li.addEventListener("click", createCreatureClickHandler(creature));
        dropdown.appendChild(li);
    }

    //Clickhandler for search choice
    function createCreatureClickHandler(creature){
        return function onCreateClick(){
            //Remove dropdown after choosing creature
            searchInput.value = creature.name;
            dropdown.style.display = "none";

            //check if in about.html
            if (window.location.pathname.includes("about.html")){
                const element = document.getElementById(creature.id);
                if (element){
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            } else {
                //check if in pages folder
                if (isPagesFolder){
                    window.location.href = `about.html#${creature.id}`;
                } else {
                    window.location.href = `pages/about.html#${creature.id}`;
                }
            }
        }
    }

    //Search input typed by the user is handled by this event listener
    searchInput.addEventListener("input", handleSearchInput);
}
//Initialize the searchbar when the document is loaded
document.addEventListener("DOMContentLoaded", initSearchBar);