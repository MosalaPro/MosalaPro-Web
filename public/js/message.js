const sendMessage = async()=> {

    const messageTitle = document.getElementById("messageTitle");
    const message = document.getElementById("messageContent");
    const err = document.getElementById("err");
    const pro_id = document.getElementById("proId");
    err.innerHTML = "";
    
    if(messageTitle.value.length < 6){
        err.classList.remove("d-none");
        err.classList.add('error_message');
        err.innerHTML = "Please enter a valid title.";
        messageTitle.classList.add("invalid");
        return;
    }
    if(message.value.length < 6){
        err.classList.remove("d-none");
        err.classList.add('error_message');
        err.innerHTML = "Please enter a valid message.";
        message.classList.add("invalid");
        return;
    }

    requestData = {
        proId: pro_id.value,
        messageTitle: messageTitle.value,
        content: message.value
    }

    _postData('/send-message', requestData )
      .then(async response => {
        if(response.status == 200){
            err.classList.remove("d-none");
            err.classList.remove('error_message');
            err.classList.add('success_message');
            err.innerHTML = "Message has been successfully sent!";
            await new Promise(r => setTimeout(r, 700));
            $('#messageModalCta .close').click();
        }
        else{
            err.innerHTML = "Error occured while sending message! else";
        }
        
      }).catch(error => {
        console.log(error) // Handle errors
        err.innerHTML = "Error occured while sending message! err "+error;
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
    return response.json();
}