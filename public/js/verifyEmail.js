const verifyCode = async()=> {
    const first_ = document.getElementById("first");
    const second_ = document.getElementById("second");
    const third_ = document.getElementById("third");
    const fourth_ = document.getElementById("fourth");
    const fifth_ = document.getElementById("fifth");
    const sixth_ = document.getElementById("sixth");
    const msg = document.getElementById("e_message");
    const id_ = document.getElementById("uId");

    msg.innerHTML = "";
    
    if(first_.value.length == 0 || first_.value == "" ){
      first_.className += " invalid";
      return;
    }
    if(second_.value.length == 0 || second_.value == "" ){
      second_.className += " invalid";
      return;
    }
    if(third_.value.length == 0 || third_.value == "" ){
      third_.className += " invalid";
      return;
    }
    if(fourth_.value.length == 0 || fourth_.value == "" ){
      fourth_.className += " invalid";
      return;
    }
    if(fifth_.value.length == 0 || fifth_.value == "" ){
      fifth_.className += " invalid";
      return;
    }
    if(sixth_.value.length == 0 || sixth_.value == "" ){
      sixth_.className += " invalid";
      return;
    }

    requestData = {
        first: first_.value,
        second: second_.value,
        third: third_.value,
        fourth: fourth_.value,
        fifth: fifth_.value,
        sixth: sixth_.value,
        id: id_.value
    }

    _postData('/verify-email', requestData )
      .then(async json => {
        if(json.status == 200){
            msg.classList.remove('error_message');
            msg.classList.add('success_message');
            msg.innerHTML = "Email address successfully verified! Redirecting...";
            await new Promise(r => setTimeout(r, 500));
            window.location = "/";
        }
        else{
            msg.innerHTML = "Code does not match. Please try again. "+json.status;
            first_.innerHTML = ""; second_.innerHTML = ""; third_.innerHTML = "";
            fourth_.innerHTML = ""; fifth_.innerHTML = ""; sixth_.innerHTML = "";
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        msg.innerHTML = "Code does not match. Please try again. ";
        first_.innerHTML = ""; second_.innerHTML = ""; third_.innerHTML = "";
        fourth_.innerHTML = ""; fifth_.innerHTML = ""; sixth_.innerHTML = "";
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