const confirmBooking = async(bookingId_)=> {

    const message = document.getElementById("booking-msg");
    requestData = {
        bookingId: bookingId_
    }

    _postData('/confirm-booking', requestData )
      .then(async json => {
        if(json.status == 200){
            message.classList.remove('error_message');
            message.classList.add('success_message');
            message.innerHTML = "You have confirm the booking! This service is now in progress.";
            await new Promise(r => setTimeout(r, 1500));
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

const cancelBooking = async(bookingId)=> {
const message = document.getElementById("booking-msg");
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

async function sendQuotation(jobId_){
  const message = document.getElementById("err_bm");
  const budget_ = document.getElementById("budget").value;
  const quotationType_ = document.getElementById("budgetType").value;
  const quotationDesc_ = document.getElementById("quotationDesc").value;

  requestData = {
      jobId: jobId_,
      budget: budget_,
      quotationDesc: quotationDesc_,
      quotationType: quotationType_,
      requestType: "booking"
  }

  _postData('/quotation', requestData )
  .then(async json => {
    if(json.status == 200){
        message.classList.remove('error_message');
        message.classList.add('success_message');
        message.innerHTML = "Quotation sent successfully! Redirecting...";
        await new Promise(r => setTimeout(r, 500));
        window.location = "/mybookings";
    }
    else if(json.status == 402){
        message.innerHTML = "An error occured. Please try again.";
        await new Promise(r => setTimeout(r, 2000));
        message.innerHTML = " ";
    }
    else{
      message.classList.add('error_message');
      message.classList.remove('success_message');
        message.innerHTML = "An error occured. Please try again. "+json.status;
    }
    
  }).catch(async err => {
    message.classList.add('error_message');
    message.classList.remove('success_message');
      message.innerHTML = "An error occured. Please try again! ";
      console.log(err) // Handle errors
      await new Promise(r => setTimeout(r, 2000));
      message.innerHTML = " ";
  });
}

async function completeBooking(bookingId_){

  const providerComments_ = document.getElementById("submissionComment").value;
  const file_ = document.getElementById("submission-file").files[0];
  const message = document.getElementById("booking-comp-err");
  requestData = {
      bookingId: bookingId_,
      providerComments: providerComments_,
      file: file_.name
  };

  _postData('/complete-booking', requestData )
    .then(async json => {
      if(json.status == 200){
          message.classList.remove('error_message');
          message.classList.add('success_message');
          message.innerHTML = "Booking successfully completed and submitted! The customer will review it and evaluate your job.";
          await new Promise(r => setTimeout(r, 1500));
          window.location = "/mybookings";
      }
      else{
        message.classList.add('error_message');
        message.classList.remove('success_message');
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