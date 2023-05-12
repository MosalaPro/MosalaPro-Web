const loginPassInput = document.getElementById("password");

loginPassInput.addEventListener("keyup", logKey);

function logKey(e) {
  if(e.code == 'Enter'){
    onLoginSubmit();
  }
}

const onLoginSubmit = async()=> {
  
    const username_ = document.getElementById("username").value;
    const password_ = document.getElementById("password").value;
    const message = document.getElementById("message");
    message.innerHTML = "";
    if(username_.length < 6){
      message.classList.add('error_message');
      message.innerHTML = "Please enter a valid username";
      return;
    }
    if(password_ == "" || password_.length < 1){
      message.classList.add('error_message');
      message.innerHTML = "Please enter a password to login.";
      return;
    }
    requestData = {
        username: username_,
        password: password_
    }

    _postData('/login-u', requestData )
      .then(async json => {
        if(json.status == 200){
            message.classList.remove('error_message');
            message.classList.add('success_message');
            message.innerHTML = "Login successful! Redirecting..";
            await new Promise(r => setTimeout(r, 700));
            window.location.reload();
        }
        else if(json.status == 402){
            message.innerHTML = "Your account is not verified! Check your email for verification code. Redirecting...";
            await new Promise(r => setTimeout(r, 2000));
            window.location = "/resendCode/"+json.id;
        }
        else{
            message.innerHTML = "Wrong username or password! "+json.status;
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        message.innerHTML = "Wrong username or password!";
      });
  }

async function _postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
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