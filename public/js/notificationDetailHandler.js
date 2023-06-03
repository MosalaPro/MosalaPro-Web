const hirePro = async(proId, jobId_)=> {

    const message = document.getElementById("notif-msg");
    requestData = {
        providerId: proId,
        jobId: jobId_
    }

    _postData('/hire-pro', requestData )
      .then(async json => {
        if(json.status == 200){
            message.classList.remove('error_message');
            message.classList.add('success_message');
            message.innerHTML = "You have hire this provider for the job! A notification has been sent";
            await new Promise(r => setTimeout(r, 1500));
            window.location = "/notifications";
        }
        else{
            message.innerHTML = "Oops. An error occured: "+json.status;
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        message.innerHTML = "Oops. An error occured. Please try again.";
      });
}

const rejectApplication = async(proId, jobId_)=> {
const message = document.getElementById("notif-msg");
  requestData = {
      providerId: proId,
      jobId: jobId_
  }

  _postData('/reject-pro', requestData )
    .then(async json => {
      if(json.status == 200){
          message.classList.remove('error_message');
          message.classList.add('success_message');
          message.innerHTML = "You have rejected the provider's application. A notification has been sent.";
          await new Promise(r => setTimeout(r, 1100));
          window.location = "/notifications";
      }
      else{
          message.innerHTML = "Oops. An error occured: "+json.status;
      }
      
    }).catch(err => {
      console.log(err) // Handle errors
      message.innerHTML = "Oops. An error occured. Please try again.";
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