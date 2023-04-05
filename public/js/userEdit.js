
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


