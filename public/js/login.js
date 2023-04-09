const onLoginSubmit = async()=> {
  
    const username_ = document.getElementById("username").value;
    const password_ = document.getElementById("password").value;
    const message = document.getElementById("message");
    
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
            await new Promise(r => setTimeout(r, 1000));
            window.location.reload();
        }
        else{
            message.innerHTML = "Wrong username or password! ";
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        message.innerHTML = "Wrong username or password! ";
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