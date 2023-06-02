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