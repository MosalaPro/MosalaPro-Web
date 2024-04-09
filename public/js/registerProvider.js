
// country and city selection on registration modal
// for providers
function _(element){return document.getElementById(element); }
_('country_p').onchange = function(){
    filename = "./data/cities/" + _('country_p').value +".json";
    
    $.getJSON(filename, function(data) {
      
      var items = [];
      items.push('<option value="">Select City</option>');
      $.each(data, function( key, val ) {
            items.push('<option value="' + val.name + '">' + val.name+ '</option>');
        });
      _('city_p').innerHTML = items;
    });
  
}

// modal validation and processing
$(document).ready(function() {
    $('#regModalCta').on('hidden', function() {
      $(':input', this).val('');
    });
});
 function enableProRegBtn(){
    document.getElementById("register-p").disabled = false;
 }


function validateAndRegisterP(){
  const pass = document.getElementById("password-input");
  const passConf = document.getElementById("password-input-conf");
  const regMessage = document.getElementById("rMessagePro");
  const category = document.getElementById("pRegisterCategory");
  const firstName = document.getElementById("pRegisterFirstName");
  const lastName = document.getElementById("pRegisterLastName");
  const email = document.getElementById("pRegisterEmail");
  const phone = document.getElementById("pRegisterPhone");
  const city = document.getElementById("city_p");
  const country = document.getElementById("country_p");
  const termsAndConds = document.getElementById('termsCheck');

  regMessage.innerHTML = "";

  if(category.value.length < 2 ){
    category.classList.add("invalid");
    regMessage.innerHTML = "Please select a category.";
    return;
  }
  if(firstName.value.length < 2){
    firstName.classList.add("invalid");
    regMessage.innerHTML = "Please enter your firstname.";
    return;
  }

  if(lastName.value.length < 2){
    lastName.classList.add("invalid");
    regMessage.innerHTML = "Please enter your lastname.";
    return;
  }

  if(!validateEmail(email.value)){
    email.classList.add("invalid");
    regMessage.innerHTML = "Please enter a valid email.";
    return;
  }
  if(isNaN(phone.value) || phone.value == "" || phone.value.length < 7){
    phone.classList.add("invalid");
    regMessage.innerHTML = "Please enter a valid phone number.";
    return;
  }

  if(country.value.length < 2){
    country.classList.add("invalid");
    regMessage.innerHTML = "Please select country.";
    return;
  }
  
  if(city.value.length < 2){
    city.classList.add("invalid");
    regMessage.innerHTML = "Please select city.";
    return;
  }

  

  regMessage.innerHTML = "";

  if (pass.value != passConf.value) {
    //alert("Passwords Do not match");
    pass.classList.add("invalid");
    passConf.classList.add("invalid");
    regMessage.innerHTML = "Passwords do not match!";
    return;
  }
  if(pass.value.length < 6){
    pass.classList.add("invalid");
    passConf.classList.add("invalid");
    regMessage.innerHTML = "Password is too short, enter a longer password.";
    return;
  }
  else{
    const specialChars = "!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~";
    let letterBoolean = pass.value.match(/[a-z]/i);
    let numBoolean = false;
    for (let i = 0; i < pass.value.length; i++) {
        if(!isNaN(pass.value[i]))
          numBoolean = true;
    }

    let specialCharBoolean = false;
        for (let i = 0; i < pass.value.length; i++) {
          for (let j = 0; j < specialChars.length; j++) {
            if (pass.value[i] == specialChars[j]) {
              specialCharBoolean = true;
            }
          }
      }
    if(!letterBoolean){
      pass.classList.add("invalid");
      passConf.classList.add("invalid");
      regMessage.innerHTML = "Include at least letter in password.";
      return;
    }
    if(!numBoolean){
      pass.classList.add("invalid");
      passConf.classList.add("invalid");
      regMessage.innerHTML = "Include at least a number in your password.";
      return;
    }
    if(!specialCharBoolean){
      pass.classList.add("invalid");
      passConf.classList.add("invalid");
      regMessage.innerHTML = "Include at least a special char in your password";
      return;
    }
  }

  if (!termsAndConds.checked){
    regMessage.innerHTML = "You must accept the terms and conditions";
    return;
  }
  
  requestData = {
    pFirstName: document.getElementById("pRegisterFirstName").value,
    pLastName: document.getElementById("pRegisterLastName").value,
    pEmail: document.getElementById("pRegisterEmail").value,
    pPhone: document.getElementById("pRegisterPhone").value,
    pAddress: document.getElementById("pRegisterAddress").value,
    pCategory: document.getElementById("pRegisterCategory").value,
    userType: document.getElementById("proType").value,
    country_p:  document.getElementById("country_p").value,
    city_p: document.getElementById("city_p").value,
    pPassword: document.getElementById("password-input").value
  }

    _postData('/register-user', requestData )
      .then(async response => {
        
        if(response.status == 200){
          
            regMessage.classList.remove('error_message');
            regMessage.classList.add('success_message');
            regMessage.innerHTML = "Registration successful! Redirecting..";
            await new Promise(r => setTimeout(r, 1000));
            document.getElementById("iddl").value = response.userId;
            document.theForm.submit();
            //window.location.replace("/verify-email");
        }
        else{
          regMessage.innerHTML  = 'An account with the given email exists, <a class="text-primary" href="#logModalCta" data-toggle="modal" data-dismiss="modal" data-caption-animate="fadeInUp">login.</a>';
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        regMessage.innerHTML = 'An account with the given email exists, <a class="text-primary" href="#logModalCta" data-toggle="modal" data-dismiss="modal" data-caption-animate="fadeInUp">login.</a>';
      });

}

async function _postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(data)
    });
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }else{ return response;}
}