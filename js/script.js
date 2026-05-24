//Thank up pop up message 
//Get link to form 

let contactForm = document.forms['contactForm'];

//Add listener for the callback 
contactForm.addEventListener("submit", getFormInfo);

//Extract the form data into an object 
function getFormInfo(event){
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