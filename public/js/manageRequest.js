const onRequestSubmit = async(id)=> {
  
    const requestTitle_ = document.getElementById("requestTitle").value;
    const requestDesc_ = document.getElementById("requestDesc").value;
    const requestCat_ = document.getElementById("requestCat").value;
    const requestBudget_ = document.getElementById("requestBudget").value;
    const requestDeadline_ = document.getElementById("requestDeadline").value;

    const message = document.getElementById("reqMessage");
    message.innerHTML = "";
    
    if(requestTitle_ == "" || requestTitle_.length < 3){
      message.classList.add('error_message');
      message.innerHTML = "Enter a valid title.";
      return;
    }
    if(requestDesc_.length < 35){
        message.classList.add('error_message');
        message.innerHTML = "Enter at least 40 characters for the description.";
        return;
    }
    if(isNaN(requestBudget_) || requestBudget_ < 10){
        message.classList.add('error_message');
        message.innerHTML = "Enter valid budget.";
        return;
        
    }
    
    requestData = {
        _id: id,
        requestTitle: requestTitle_,
        requestDescription: requestDesc_,
        requestCategory: requestCat_,
        budget: requestBudget_,
        deadline: requestDeadline_,
    }

    _postData('/update-sr', requestData )
      .then(async json => {
        if(json.status == 200){
            message.classList.remove('error_message');
            message.classList.add('success_message');
            message.innerHTML = "Changes have been saved successfully. Redirecting...";
            await new Promise(r => setTimeout(r, 700));
            window.location = "/myrequests";
        }
        else if(json.status == 402){
            message.innerHTML = "Your account is not verified! Check your email for verification code. Redirecting...";
            await new Promise(r => setTimeout(r, 2000));
            window.location = "/myrequests";
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

function reset(id){
  $( "#request" ).load( `/manage-request?rq=${id} #request` );
}