async function getApplications(type){

      const hired = document.getElementById("hired-ja");
      const active = document.getElementById("active-ja");
      const cancelled = document.getElementById("cancelled-ja");
      const all = document.getElementById("all-ja");
      if(type=="all"){
        hired.classList.remove("active");
        cancelled.classList.remove("active");
        active.classList.remove("active");
        all.classList.add("active");
      }
      else if(type=="active"){
        hired.classList.remove("active");
        cancelled.classList.remove("active");
        active.classList.add("active");
        all.classList.remove("active");
      }
      else if(type=="cancelled"){
        hired.classList.remove("active");
        cancelled.classList.add("active");
        active.classList.remove("active");
        all.classList.remove("active");
      }
      else if(type=="hired"){
        hired.classList.add("active");
        cancelled.classList.remove("active");
        active.classList.remove("active");
        all.classList.remove("active");
      }
  
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    window.history.replaceState(null, null, url); 
    const res = await fetch(`/get-applications?type=${type}`);
    const applications = await res.json();
  
    const applicationsBox = document.getElementById("applications-container");
    applicationsBox.innerHTML = "";
    let content = "";
    if(applications.length == 0)
          applicationsBox.innerHTML = '<div class="d-flex justify-content-center"><h6 class="text-light text-muted align-items-center">No booking found!</h6></div>';
    else{
      const classes = ["bg-soft-danger", "bg-soft-base", "bg-soft-warning", "bg-soft-success", "bg-soft-info"];
      for(const job of applications) {
        let date = job.createdAt.split("-");
        let partHtml = "";
        if(job.status == "active")
          partHtml = `<a class="btn-job btn-primary-job-inv" href="/job-application/${job._id}">Manage application</a>`;
        else
          partHtml = `<a class="btn-job btn-primary-job-inv-blue" href="/job-application/${job._id}">View details</a>`
          const reqt =  `
                <div class="col-lg-4 col-md-6 col-12 mt-1 pt-2">
                <div class="card border-0 bg-light-job rounded-job shadow-job">
                    <div class="card-body p-4">
                        

                    <span class="btn btn-sm ${classes[Math.floor(Math.random() * 5)]} cat-job float-md-right mb-3 mb-sm-0">${job.requestCategory}</span>
                    <h5>${job.requestTitle}</h5>
                    <div class="mt-3">
                        <span class="d-block job-details"><b class="fa fa-money mr-2" aria-hidden="true"></b>  Budget: ${job.budget}</span>
                        <span class="d-block job-details"><b class="fa fa-briefcase mr-2" aria-hidden="true"></b> Deadline: ${job.deadline}</span>
                    </div>
                    <div class="mt-3 border-bottom pb-4 d-flex ">
                        <a class="btn-job btn-primary-job-inv" href="/job-application/${job._id}">View application details</a>
                        
                    </div>
                        
                    </div>
                
                </div>
            </div>
              `;
          content = content + reqt;
        }
        applicationsBox.innerHTML = content;
      } 
      
  }