/* STORAGE KEYS */
const PETS_KEY = "petconnect_pets_v2";
const REQS_KEY = "petconnect_requests_v2";
const USER_KEY = "petconnect_user_v2";

/* DEFAULT PETS */
const defaultPets = [
  { id: "p1", name: "Buddy", img: "https://placedog.net/800/500?id=1", desc: "Friendly & playful", location: "Paw Shelter, Pune", price: "Free", contact: "+91 98765 43210" },
  { id: "p2", name: "Max", img: "https://placedog.net/800/500?id=2", desc: "Loves cuddles", location: "Happy Paws, Mumbai", price: "₹2000", contact: "+91 98100 98765" },
  { id: "p3", name: "Bella", img: "https://placedog.net/800/500?id=3", desc: "Calm companion", location: "Adopt4Life, Delhi", price: "Free", contact: "+91 93256 78901" },
  { id: "p4", name: "Rocky", img: "https://placedog.net/800/500?id=4", desc: "Energetic pup", location: "StreetRescue, Pune", price: "₹1500", contact: "+91 98765 01234" },
  { id: "p5", name: "Milo", img: "https://placedog.net/800/500?id=5", desc: "Cute & loyal", location: "PetHearts, Nashik", price: "Free", contact: "+91 90127 86543" }
];

/* HELPERS: load/save */
function loadPets(){ const raw = localStorage.getItem(PETS_KEY); if(!raw){ localStorage.setItem(PETS_KEY, JSON.stringify(defaultPets)); return defaultPets.slice(); } try{return JSON.parse(raw)}catch(e){return defaultPets.slice()} }
function savePets(list){ localStorage.setItem(PETS_KEY, JSON.stringify(list)) }
function loadReqs(){ return JSON.parse(localStorage.getItem(REQS_KEY) || "[]") }
function saveReqs(arr){ localStorage.setItem(REQS_KEY, JSON.stringify(arr)) }
function loadUser(){ return JSON.parse(localStorage.getItem(USER_KEY) || "null") }
function saveUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)) }

/* SCREEN MANAGEMENT */
const screens = {
  login: document.getElementById("loginScreen"),
  signup: document.getElementById("signupScreen"),
  home: document.getElementById("homeScreen"),
  profile: document.getElementById("profileScreen"),
  chat: document.getElementById("chatScreen"),
  help: document.getElementById("helpScreen")
};
function showScreen(key){
  Object.values(screens).forEach(s=> { s.classList.add("hidden"); s.classList.remove("active"); });
  screens[key].classList.remove("hidden"); screens[key].classList.add("active");
  window.scrollTo(0,0);
}

/* BOTTOM NAV - only works if logged in */
document.querySelectorAll(".bottom-nav .nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=> {
    const target = btn.dataset.target;
    if(!loadUser()){ showScreen("login"); return; }
    showScreen(target.replace("Screen",""));
    if(target === "homeScreen") renderPets();
  });
});

/* INIT: show home if logged in, else login */
if(loadUser()){ populateProfile(); showScreen("home"); renderPets(); } else { showScreen("login"); }

/* AUTH: goto links */
document.getElementById("gotoSignup").onclick = ()=> showScreen("signup");
document.getElementById("gotoLogin").onclick = ()=> showScreen("login");

/* SIGNUP */
document.getElementById("signupBtn").onclick = ()=>{
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const pass = document.getElementById("signupPass").value.trim();
  if(!name||!email||!phone||!pass){ alert("Please fill all fields"); return; }
  saveUser({ name, email, phone, pass });
  alert("Signup complete. Now login.");
  document.getElementById("signupName").value=""; document.getElementById("signupEmail").value=""; document.getElementById("signupPhone").value=""; document.getElementById("signupPass").value="";
  showScreen("login");
};

/* LOGIN */
document.getElementById("loginBtn").onclick = ()=>{
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const user = loadUser();
  if(user && user.email===email && user.pass===pass){
    populateProfile();
    showScreen("home");
    renderPets();
    document.getElementById("loginEmail").value=""; document.getElementById("loginPass").value="";
  } else alert("Invalid credentials or no account. Please sign up.");
};

function populateProfile(){
  const user = loadUser();
  if(!user) return;
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profilePhone").textContent = user.phone;
}

/* LOGOUT */
document.getElementById("logoutBtn").onclick = ()=> { showScreen("login"); };

/* RENDER PETS */
function renderPets(){
  const pets = loadPets();
  const reqs = loadReqs();
  const container = document.getElementById("petList");
  container.innerHTML = "";
  pets.forEach(p=>{
    const card = document.createElement("div");
    card.className = "pet-card";
    const requested = reqs.includes(p.id);
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p class="muted">${p.desc || ""}</p>
      <p class="pet-meta">${p.location}</p>
      <p><b>${p.price}</b></p>
      <p class="muted">Contact: <a href="tel:${p.contact}">${p.contact}</a></p>
      <div style="margin-top:8px">
        <button class="btn adopt-btn" data-id="${p.id}" ${requested ? "disabled" : ""}>${requested ? "Requested" : "Request for Adoption"}</button>
      </div>
    `;
    container.appendChild(card);
  });

  // attach click handlers for adopt buttons
  document.querySelectorAll(".adopt-btn").forEach(b=>{
    b.addEventListener("click", (e)=>{
      const id = e.currentTarget.dataset.id;
      openModalFor(id);
    });
  });
}

/* MODAL & REQUEST FLOW */
let activePet = null;
function openModalFor(id){
  const pets = loadPets();
  const pet = pets.find(x=>x.id===id);
  if(!pet) return;
  activePet = pet;
  document.getElementById("modalImg").src = pet.img;
  document.getElementById("modalName").textContent = pet.name;
  document.getElementById("modalDesc").textContent = pet.desc || "";
  document.getElementById("modalCenter").textContent = pet.location;
  document.getElementById("modalPrice").textContent = pet.price;
  document.getElementById("modalContact").textContent = pet.contact;
  document.getElementById("adoptModal").classList.remove("hidden");
}

document.getElementById("closeModal").onclick = ()=> { activePet = null; document.getElementById("adoptModal").classList.add("hidden"); };
document.getElementById("cancelRequest").onclick = ()=> { activePet = null; document.getElementById("adoptModal").classList.add("hidden"); };

document.getElementById("confirmRequest").onclick = ()=>{
  if(!activePet) return;
  const reqs = loadReqs();
  if(!reqs.includes(activePet.id)) reqs.push(activePet.id);
  saveReqs(reqs);
  renderPets();
  document.getElementById("adoptModal").classList.add("hidden");
  alert("Request sent! (simulated)");
  activePet = null;
};

/* POST DOG (save image as data URL) */
let lastImageData = null;
const inputFile = document.getElementById("dogImage");
const imgPreview = document.getElementById("imgPreview");
inputFile.addEventListener("change", (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    lastImageData = ev.target.result;
    imgPreview.src = lastImageData; imgPreview.classList.remove("hidden");
  };
  reader.readAsDataURL(f);
});

document.getElementById("postDogBtn").onclick = ()=>{
  const name = document.getElementById("dogName").value.trim();
  const center = document.getElementById("dogCenter").value.trim();
  const contact = document.getElementById("dogContact").value.trim();
  const price = document.getElementById("dogPrice").value.trim() || "Free";
  if(!name || !center || !contact || !lastImageData){ alert("Fill all fields and upload an image"); return; }
  const pets = loadPets();
  const newPet = { id: "p"+Date.now(), name, img: lastImageData, desc: "Posted by user", location: center, price, contact };
  pets.unshift(newPet);
  savePets(pets);
  // reset
  document.getElementById("dogName").value=""; document.getElementById("dogCenter").value=""; document.getElementById("dogContact").value=""; document.getElementById("dogPrice").value=""; inputFile.value=""; imgPreview.src=""; imgPreview.classList.add("hidden"); lastImageData = null;
  renderPets();
  alert("Dog posted!");
  showScreen("home");
};

/* CHAT (bubble style) and emoji dropdown */
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendMsg");
const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");

// improve emojiPicker element: ensure it has emoji buttons (if not present, add)
if(emojiPicker && emojiPicker.children.length === 0){
  const emojis = ["😄","😂","😍","😭","👍","🙏","🔥","🎉"];
  emojis.forEach(em=>{
    const b = document.createElement("button");
    b.className = "emoji";
    b.textContent = em;
    emojiPicker.appendChild(b);
  });
}

// toggle dropdown
emojiToggle.onclick = ()=>{
  if(!emojiPicker) return;
  emojiPicker.classList.toggle("show");
};

// clicking emoji inserts into chat input
document.addEventListener("click", (e)=>{
  if(e.target.classList && e.target.classList.contains("emoji")){
    chatInput.value += e.target.textContent;
    chatInput.focus();
    // keep emoji dropdown open for more selection
  } else {
    // clicking outside emojiPicker closes it
    if(emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiToggle){
      emojiPicker.classList.remove("show");
    }
  }
});

// send message
sendBtn.addEventListener("click", ()=>{
  const txt = chatInput.value.trim();
  if(!txt) return;
  const user = loadUser();
  const name = user ? user.name.split(" ")[0] : "You";
  const div = document.createElement("div");
  div.className = "chat-msg you";
  div.innerHTML = `<strong>${name}:</strong> ${escapeHtml(txt)}`;
  chatMessages.appendChild(div);
  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// helper: escape HTML in chat messages to avoid injection
function escapeHtml(unsafe){
  return unsafe.replace(/[&<"'>]/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]; });
}

/* INIT */
(function init(){
  if(!localStorage.getItem(PETS_KEY)) savePets(defaultPets);
  renderPets();
})();
// DELETE POST BUTTON HANDLER
document.addEventListener("click", (e)=>{
  if(e.target.classList.contains("delete-btn")){
    const card = e.target.closest(".pet-card");
    const name = card.querySelector(".pet-meta")?.textContent?.trim();

    if(confirm(`Delete post "${name}"?`)){
      // remove from DOM
      card.remove();

      // remove from localStorage if saved there
      let pets = JSON.parse(localStorage.getItem("pets") || "[]");
      pets = pets.filter(p => p.name !== name);
      localStorage.setItem("pets", JSON.stringify(pets));
    }
  }
});
