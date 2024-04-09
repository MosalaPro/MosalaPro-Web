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
            message.innerHTML = "An error occured while saving your changes. Please try again. Redirecting...";
            await new Promise(r => setTimeout(r, 1500));
            window.location = "/myrequests";
        }
        else{
            message.innerHTML = "An error occured while saving your changes. Please try again. ";
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        message.innerHTML = "An error occured while saving your changes. Please try again.";
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

async function resubmit(requestId){
    const message = document.getElementById("reqMessage");
    message.innerHTML = "";
    requestData = {
      jobId: requestId
    }

  _postData('/resubmit-request', requestData )
    .then(async json => {
      if(json.status == 200){
          message.classList.remove('error_message');
          message.classList.add('success_message');
          message.innerHTML = "Your request has been resubmitted successfully. Redirecting...";
          await new Promise(r => setTimeout(r, 700));
          window.location = "/myrequests";
      }
      else if(json.status == 402){
          message.innerHTML = "An error occured while resubmitting your changes. Please try again. Redirecting...";
          await new Promise(r => setTimeout(r, 1500));
          window.location = "/myrequests";
      }
      else{
          message.innerHTML = "An error occured while resubmitting your changes. Please try again.";
      }
      
    }).catch(err => {
      console.log(err) // Handle errors
      message.innerHTML = "An error occured while resubmitting your changes. Please try again.";
    });
}

async function cancelRequest(requestId){

    const message = document.getElementById("reqMessage");
    message.innerHTML = "";

    requestData = {
      jobId: requestId
    }

  _postData('/cancel-request', requestData )
    .then(async json => {
      if(json.status == 200){
          message.classList.remove('error_message');
          message.classList.add('success_message');
          message.innerHTML = "Your request has been cancelled successfully. Redirecting...";
          await new Promise(r => setTimeout(r, 700));
          window.location = "/myrequests";
      }
      else if(json.status == 402){
          message.innerHTML = "An error occured while cancelling your changes. Please try again. Redirecting...";
          await new Promise(r => setTimeout(r, 1500));
          window.location = "/myrequests";
      }
      else{
          message.innerHTML = "An error occured while cancelling your changes. Please try again.";
      }
      
    }).catch(err => {
      console.log(err) // Handle errors
      message.innerHTML = "An error occured while cancelling your changes. Please try again.";
    });

}

async function cancelBooking(bookingId){
  const message = document.getElementById("reqMessage");
    requestData = {
        bookingId: bookingId
    }
  
    _postData('/cancel-booking', requestData )
      .then(async json => {
        if(json.status == 200){
            message.classList.remove('error_message');
            message.classList.add('success_message');
            message.innerHTML = "This booking has been cancelled. The request is available to other providers.";
            await new Promise(r => setTimeout(r, 1100));
            window.location = "/mybookings";
        }
        else{
            message.innerHTML = "Oops. An error occured: "+json.status;
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        message.innerHTML = "Oops. An error occured. Please try again.";
      });
  }