
let skills = [];

const loadSkills = () => {
  const skillsArray = document.getElementById('skillsData').dataset.skills;
  skills = skillsArray.split(',');
  document.getElementById("skillsForm").value = skillsArray;
 
  console.log(skillsArray);
}

const updateSkills = () => {
  document.getElementById('skillsData').dataset.skills = skills.length > 1 ? skills.join(',') : skills[0];
} 

const addNewSkill = () => {
  const skill = document.getElementById("inputSkill").value;
  const skillBox = document.getElementById("skillBox");
  const newSkill = `<div class="d-flex justify-content-between my-2">
                      <p>${skill}</p>
                      <img style="width: 20px;" src="icons/delete-icon.svg" onClick="removeSkill(this, '${skill}');"/>
                    </div>`;

  if(skill !== "") {
    skillBox.innerHTML += newSkill;
    skills.push(skill);
    document.getElementById("skillsForm").value = skills;
    document.getElementById("inputSkill").value = "";
    updateSkills();
  }
}

const removeSkill = (e, skill) => {
  const newSkills = skills.filter(s => s !== skill);
  skills = newSkills;
  document.getElementById("skillsForm").value = newSkills;
  e.parentElement.remove();
  console.log(e.parentElement);
  updateSkills();
}


const onPhotoChange = () => {
  const photoInput = document.getElementById('photoInput');
  const photoBox = document.getElementById('photoBox');

  const photoURL = URL.createObjectURL(photoInput.files[0]);

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    console.log(event.target);
    photoBox.style.backgroundImage = `url(${event.target.result})`;
  });

  reader.readAsDataURL(photoInput.files[0]);
}

  loadSkills(); 
    setTimeout(() =>  {
      const category = document.getElementById("user-category");
      const country = document.getElementById("country_search");
      const city = document.getElementById("city_search");
      country.value = "<%= usr.country %>" ;
      category.value = "<%= usr.category %>" ;
      const event = new Event('change');
      country.dispatchEvent(event);

      setTimeout(() =>  city.value = "<%= usr.city %>", 100);
    }, 100);
  

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
  }


