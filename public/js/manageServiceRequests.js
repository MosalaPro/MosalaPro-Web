async function getRequests(type){

  const completed = document.getElementById("completed-bookings");
    const inprogress = document.getElementById("inprogress-bookings");
    const active = document.getElementById("active-bookings");
    const cancelled = document.getElementById("cancelled-bookings");
    const missing = document.getElementById("missing-bookings");
    const all = document.getElementById("all-bookings");
    if(type=="all"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.add("active");
      inprogress.classList.remove("active");
    }
    else if(type=="active"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.add("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
    }
    else if(type=="in-progress"){
      inprogress.classList.add("active");
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.remove("active");
    }
    else if(type=="cancelled"){
      completed.classList.remove("active");
      cancelled.classList.add("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
    }
    else if(type=="completed"){
      completed.classList.add("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
    }
    else if(type=="missing-details"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.add("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
    }

  const url = new URL(window.location.href);
  url.searchParams.set('type', type);
  window.history.replaceState(null, null, url); 
  const res = await fetch(`/getbookings?type=${type}`);
  const bookings = await res.json();

  const bookingsBox = document.getElementById("requests-container");
  bookingsBox.innerHTML = "";
  let content = "";
  if(bookings.length == 0)
        bookingsBox.innerHTML = '<div class="d-flex justify-content-center align-items-center"><h6 class="text-light text-muted">No booking found!</h6></div>';
  else{
    const classes = ["bg-soft-danger", "bg-soft-base", "bg-soft-warning", "bg-soft-success", "bg-soft-info"];
    for(const booking of bookings) {
      let date = booking.createdAt.split("-");
        const reqt =  `
            <div class="col-lg-4 col-md-6 col-12 mt-1 pt-2">
              <div class="card border-0 bg-light-job rounded-job shadow-job">
                  <div class="card-body p-4">
                  <span class="btn btn-sm ${classes[Math.floor(Math.random() * 5)]} cat-job float-md-right mb-3 mb-sm-0">Category</span>
                  <h5>${ booking.bookingTitle }</h5>
                  <div class="mt-3">
                      <span class="d-block job-details"><b class="fa fa-money mr-2" aria-hidden="true"></b>  Budget: ${ booking.budget }</span>
                      <span class="d-block job-details"><b class="fa fa-calendar mr-2" aria-hidden="true"></b> Deadline: ${ booking.deadline }</span>
                  </div>
                  <div class="mt-3 border-bottom pb-4 d-flex ">
                      <a class="btn-job btn-primary-job-inv" href="/sr/">Manage booking</a>
                      
                  </div>
                      <div class=""><span class="float-md-right text-small mt-1">Submitted on ${date[1]}/${date[2].substr(0,2)}/${date[0]}</span></div>
                  </div>
              
              </div>
            </div>
            `;
        content = content + reqt;
      }
      bookingsBox.innerHTML = content;
    } 
    
}