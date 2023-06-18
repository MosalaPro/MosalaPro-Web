async function getMessages(userId_){
    const chatBoxTop = document.getElementById('chat-box-top');
    const chatContent = document.getElementById('chat-content');
    alert(userId_);
    requestData = {
        userId: userId_,
    }
    
    postData('/messages', requestData )
      .then(async json => {
        if(json.status == 200){
            chatBoxTop.innerHTML = `<div class="position-relative">
                                <img src="/photo/${json.chatUser.photo}" class="rounded-circle mr-1" alt="${json.chatUser.firstName} ${chatUser.lastName} " width="40" height="40">
                                </div>
                                <div class="flex-grow-1 pl-3">
                                    <strong>${chatUser.firstName} ${json.chatUser.lastName}</strong>
                                    <div class="text-muted small"><em>${json.chatUser.accountType}</em></div>
                                </div>`;

            let chat = "";
                

            for(const dat of data){
                if(usr._id == dat.senderId){
                    chat = chat +  `<div class="chat-message-right pb-4">
                        <div>
                            <img src="/photo/${usr.photo}" class="rounded-circle mr-1" alt="" width="40" height="40">
                            
                        </div>
                        <div class="flex-shrink-1 bg-light text-primary rounded py-2 sender-chat px-3 mr-3">
                            
                            <div class="font-weight-bold mb-1">You</div>
                            ${ dat.content }
                            <div class="text-muted small text-nowrap mt-2">${dat.createdAt}</div>
                        </div>
                        </div>`;
                }else{
                    chat = chat + ` <div class="chat-message-left pb-4">
                            <div>
                                <img src="/photo/${chatUser.firstName}" class="rounded-circle mr-1" alt="${chatUser.firstName} ${chatUser.lasttName}" width="40" height="40">
                                <div class="text-muted small text-nowrap mt-2">${dat.createdAt}</div>
                            </div>
                            <div class="flex-shrink-1 bg-light text-primary rounded py-2 px-3 ml-3">
                                <div class="font-weight-bold mb-1">${chatUser.firstName} ${chatUser.lasttName}</div>
                                ${dat.content}
                            </div>
                            </div>`;
                }

            }
            
            chatContent.innerHTML = chat;
               
            await new Promise(r => setTimeout(r, 500));
            $('#message-block').load('/messages #message-block');
        }
        else{
            console.log("Error occured: "+json.message);
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        mess.innerHTML = "Error: "+err;
      });

}

async function postData(url = '', data = {}) {
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

