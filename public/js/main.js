function getCurrentDate(){
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October","November", "December"];
    let date = new Date();
    if (date.getSeconds()<10){
    document.querySelector("#time").innerHTML='<p class="text-primaryColor">'+days[date.getDay()]+", "+months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()+"\n"+date.getHours()+":"+date.getMinutes()+":0"+date.getSeconds()+"</p>";}
    else{
        document.querySelector("#time").innerHTML='<p class="text-primaryColor"> <em>'+days[date.getDay()]+", "+months[date.getMonth()]+" "+date.getDate()+", "+date.getFullYear()+"\n"+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"<em></p>";}

}

setInterval(getCurrentDate,1000);


function disable(id){
    if (document.getElementById(id).disabled){
        document.getElementById(id).disabled=false;
    }
   else{ document.getElementById(id).disabled=true;}
}


document.querySelector('button[type="submit"]').addEventListener("click",(event)=>validate("petGiveAway"));
document.querySelector('button[type="submit"]').addEventListener("click",(event)=>validate("search"));


function toggleInput(inputId) {
    const inputField = document.getElementById(inputId);
    const checkbox = document.getElementById('breedNoPref');

    if (checkbox.checked) {
        inputField.disabled = true;
        inputField.value = ''; // Clear the text input if checkbox is checked
    } else {
        inputField.disabled = false;
    }
}

function toggleCheckbox(checkboxId) {
    const inputField = document.getElementById('breed');
    const checkbox = document.getElementById(checkboxId);

    if (inputField.value.trim() !== '') {
        checkbox.checked = false; // Uncheck the checkbox if there's text input
    }
}

document.querySelector('button[type="submit"]').addEventListener("click", (event) => validate("search"));
function validateForm(event) {
    let form = event.target;
    let valid = true;
    let alertMessage = "";

    // Loop through the form elements
    for (let i = 0; i < form.elements.length; i++) {
        let element = form.elements[i];
        
        // Skip elements that are disabled, since they're not required
        if (element.disabled || element.type === 'submit' || element.type === 'reset') {
            continue;
        }

        // For text inputs, check if they are empty
        if (element.type === 'text' && !element.value.trim()) {
            alertMessage = "Please fill out all required fields.";
            valid = false;
            break;
        }

        // For select inputs, check if they are empty
        if (element.type === 'select-one' && !element.value.trim()) {
            alertMessage = "Please select an option from all required fields.";
            valid = false;
            break;
        }

        // For checkboxes/radios, ensure at least one checkbox/radio in the group is checked
        if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
            let relatedInputs = form.querySelectorAll(`input[name="${element.name}"]`);
            let atLeastOneChecked = Array.from(relatedInputs).some(input => input.checked);

            if (!atLeastOneChecked) {
                alertMessage = "Please make a selection for all required fields.";
                valid = false;
                break;
            }
        }
    }

    if (!valid) {
        alert(alertMessage);
        event.preventDefault(); // Prevent form submission if validation fails
        return false;
    }

    return true;
}

// Remove multiple listeners and only keep one
document.querySelector('form#search').addEventListener("submit", (event) => {
    if (!validateForm(event)) {
        event.preventDefault(); // Prevent form submission if validation fails
    }
});




// document.getElementById('registerForm').addEventListener('submit', function(event) {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
//     const errorMessage = document.getElementById('error-message');

//     // Validate username
//     const usernamePattern = /^[A-Za-z0-9]+$/;
//     if (!usernamePattern.test(username)) {
//         errorMessage.textContent = 'Username can only contain letters and digits.';
//         event.preventDefault();
//         return;
//     }

//     // Validate password
//     const passwordPattern = /^[A-Za-z0-9]{4,}$/;
//     const hasLetter = /[A-Za-z]/.test(password);
//     const hasDigit = /\d/.test(password);
//     if (!passwordPattern.test(password) || !hasLetter || !hasDigit) {
//         errorMessage.textContent = 'Password must be at least 4 characters long, contain only letters and digits, and include at least one letter and one digit.';
//         event.preventDefault();
//         return;
//     }
// });



