// country and city selection options
function _(element){return document.getElementById(element); }
_('country_search').onchange = function(){
    filename = "./data/cities/" + _('country_search').value +".json";
    $.getJSON(filename, function(data) {
      var items = [];
      items.push('<option value="">City</option>');
      $.each(data, function( key, val ) {
            items.push('<option value="' + val.name + '">' + val.name+ '</option>');
        });
        _('city_search').innerHTML = items;
     });
     handleSearch();
}
_("city_search").onchange = function(){
      handleSearch();
}
    

// search result based on filters
const prepareProfessionalsSearch = () => {
  const country = document.getElementById("country_search");
  const city = document.getElementById("city_search");
  const search = document.getElementById("search");
  console.log('country', country)
  console.log('city', city)
  console.log('search', search)

  const params = new URLSearchParams(window.location.search);
  const countryParam = !params.get("country_search") || params.get("country_search") === "Country" ? "" : params.get("country_search");
  const cityParam = !params.get("city_search") || params.get("city_search") === "Select City" ? "" : params.get("city_search");
  const searchParam = !params.get("search") || params.get("search") === "" ? "" : params.get("search");
  const categoryParam = !params.get("category") || params.get("category") === "" ? "" : params.get("category");
  
  country.value = countryParam;
  setTimeout(() =>  {
    const event = new Event('change');
    country.dispatchEvent(event);

    setTimeout(() =>  { 
      city.value = cityParam;
      handleSearch();
    }, 500);
  }, 1000);
  
  search.value = searchParam;
}

prepareProfessionalsSearch();

const handleSearch = async () => {
  const params = new URLSearchParams(window.location.search);
  const country = document.getElementById("country_search");
  const city = document.getElementById("city_search");
  const search = document.getElementById("search");
  const categoryParam = !params.get("category") || params.get("category") === "" ? "" : params.get("category");
  

  console.log("country", country)
  console.log("city", city)
  console.log("search", search)

  const url = new URL(window.location.href);

  console.log(url);
  url.searchParams.set('category', categoryParam);
  url.searchParams.set('country_search', country.value);
  url.searchParams.set('city_search', city.value);
  url.searchParams.set('search', search.value);

  window.history.replaceState(null, null, url); 
  
  const res = await fetch(`/find-professionals?category=${categoryParam}&country_search=${country.value}&city_search=${city.value}&search=${search.value}`);
  const professionals = await res.json();
  const classes = ["bg-soft-danger", "bg-soft-base", "bg-soft-warning", "bg-soft-success", "bg-soft-info"];

  const professionalsBox = document.getElementById("professionals-box");
  professionalsBox.innerHTML = "";
  let content = "";
  if(professionals.length == 0)
        professionalsBox.innerHTML = '<div class="d-flex justify-content-center align-items-center"><h6 class="text-light text-muted">No service provider found!</h6></div>';
  else{
    for(const prof of professionals) {
            const pict = prof.photo === "" ? "default.png" : prof.photo;
            const item = `
            <tr>
            <td>
                <div class="widget-26-job-emp-img">
                    <img src="/photo/${pict}" alt="Company" />
                </div>
            </td>
            <td>
                <div class="widget-26-job-title">
                    <a href="#">${prof.firstName} ${prof.lastName }</a>
                    <p class="m-0"><a href="#" class="employer-name">${prof.role}</a> </p>
                </div>
            </td>
            <td>
                <div class="widget-26-job-info">
                    <p class="type m-0">Full-Time</p>
                    <p class="text-muted m-0">in <span class="location">${prof.city}, ${prof.country}</span></p>
                </div>
            </td>
            <td>
                <div class="widget-26-job-salary">$${prof.rate}/hr</div>
            </td>
            <td>
                <div class="widget-26-job-category ${classes[Math.floor(Math.random() * 5)]}">
                    <b class="fa fa-briefcase mr-2"></b>
                    <span>${ prof.category}</span>
                </div>
            </td>
            <td>
                <div class="widget-26-job-starred">
                    <a href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </a>
                </div>
            </td>
            </tr>`
            content = content + item;
            console.log(prof);
        
    }
    professionalsBox.innerHTML = content;
  }

}