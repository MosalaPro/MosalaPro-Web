function applyForJob(){

    const jobId = document.getElementById("jobId").value;
    const creatorUsername = document.getElementById("userName").value;
    const mess = document.getElementById("mess");
    mess.innerHTML="";

    requestData = {
        username: creatorUsername,
        jobId: jobId,
    }
    
    _postData('/apply-for-sr', requestData )
      .then(async json => {
        if(json.status == 200){
            mess.classList.remove('error_message');
            mess.classList.add('success_message');
            mess.innerHTML = "Your application has been sent successfully!";
            await new Promise(r => setTimeout(r, 1200));
            $('#jobDetailModal1 .close').click();
            window.location = "/service-requests"
        }
        else{
            mess.innerHTML = "Error json status: "+json.status;
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        mess.innerHTML = "Error: "+err;
      });

}

async function sendQuotation(jobId_){
  const message = document.getElementById("err_m");
  const budget_ = document.getElementById("budget").value;
  const quotationType_ = document.getElementById("budgetType").value;
  const quotationDesc_ = document.getElementById("quotationDesc").value;

  requestData = {
      jobId: jobId_,
      budget: budget_,
      quotationDesc: quotationDesc_,
      quotationType: quotationType_,
      requestType: "application"
  }

  _postData('/quotation', requestData )
  .then(async json => {
    if(json.status == 200){
        message.classList.remove('error_message');
        message.classList.add('success_message');
        message.innerHTML = "Quotation sent successfully! Redirecting...";
        await new Promise(r => setTimeout(r, 500));
        window.location = "/service-requests";
    }
    else if(json.status == 402){
        message.innerHTML = "An error occured. Please try again.";
        await new Promise(r => setTimeout(r, 2000));
        message.innerHTML = " ";
    }
    else{
        message.innerHTML = "An error occured. Please try again. "+json.status;
    }
    
  }).catch(async err => {
    
      message.innerHTML = "An error occured. Please try again! ";
      console.log(err) // Handle errors
      await new Promise(r => setTimeout(r, 2000));
      message.innerHTML = " ";
  });
}


function downloadFile(filename){
  //const filename = document.getElementById("").value;
  location.replace('files/'+filename);
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

async function cancelApplication(jobId_){

    const mess = document.getElementById("mess");
    mess.innerHTML="";
    requestData = {
        jobId: jobId_
    }
    
    _postData('/cancel-application', requestData )
      .then(async json => {
        if(json.status == 200){
            mess.classList.remove('error_message');
            mess.classList.add('success_message');
            mess.innerHTML = "You successfully cancelled your application for this service request.";
            await new Promise(r => setTimeout(r, 1200));
            //window.location = "/service-requests"
        }
        else{
            mess.innerHTML = "Error json status: "+json.status;
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        mess.innerHTML = "Error: "+err;
      });
}