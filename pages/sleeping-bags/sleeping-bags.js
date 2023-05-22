
import {
  handleHttpErrors,
  sanitizeStringWithTableRows,
  setStatusMsg,
  makeOptions,
} from "../../utils.js";

const apiURL = "https://sleepingbagbackend.azurewebsites.net";
const URL = apiURL + "/sleeping-bags";

let sleepingBags;
let tripInfo = {};

export function initSleepingBags() {
  document
    .getElementById("submit-info")
    ?.addEventListener("click", sleepingBagFormSend);

  document.getElementById("temp")?.addEventListener("input", adjustTempValue);

  document
    .getElementById("price-min")
    ?.addEventListener("input", adjustPriceValueMin);
  document
    .getElementById("price-max")
    ?.addEventListener("input", adjustPriceValueMax);

  document
    .getElementById("create-member")
    ?.addEventListener("click", saveResult);

  document
    .querySelector("#delete-user-confirm")
    ?.addEventListener("click", deleteUserById);

    showLogin();    

  if (localStorage.getItem("user") !== null ) {
    getMember();
  } 
}

async function getMember() {

  const options = makeOptions("GET", null, true);

  const result = await fetch(apiURL + "/member", options).then(
    handleHttpErrors
  );

  if (result.isFemale === true) {
    document.getElementById("gender-female").checked = true;
  } else if (result.isFemale === false) {
    document.getElementById("gender-male").checked = true;
  }

  document.getElementById("height").value = result.personHeight;

  if (result.isInStore) {
    document.getElementById("not-wider").checked = true;
  } else if (!result.isInStore) {
    document.getElementById("not-wider").checked = false;
  }

  if (result.innerMaterial === "Dun") {
    document.querySelector("#fill-dun").checked = true;
  } else if (result.innerMaterial === "Fiber") {
    document.querySelector("#fill-fiber").checked = true;
  }

  if (result.isColdSensitive === true) {
    document.getElementById("cold-yes").checked = true;
  } else if (result.isColdSensitive === false) {
    document.getElementById("cold-no").checked = true;
  }

  document.getElementById("temp-value").textContent =
    result.environmentTemperatureMin;

  document.getElementById("temp").value = result.environmentTemperatureMin;

  document.getElementById("price-value-min").textContent = result.minCost;
  document.getElementById("price-min").value = result.minCost;

  document.getElementById("price-value-max").textContent = result.maxCost;
  document.getElementById("price-max").value = result.maxCost;

  document.querySelector("#delete-user-question").innerHTML = `
  <p>Er du sikker på, at du vil slette din bruger?</p>
  <button class="btn" id="delete-user-confirm">Ja</button>
  <button class="btn btn-secondary"
  type="button"
  data-bs-dismiss="modal"
  aria-label="Close">Nej</button>
  `
  document.querySelector("#delete-user-confirm")?.addEventListener("click", deleteUserById)

  showLogout(result.email);
  sleepingBagFormSend();
}

function showLogin() {
  document.getElementById("menu").innerHTML = `
    <li class="nav-item">
    <button                
    type="button"
    class="btn bg-opacity-0 text-white"
    id="login-modal-btn-top"
    data-bs-toggle="modal"
    data-bs-target="#loginModalBox"
  >
    Log ind
  </button>
  </li>
  `;

  document.getElementById("login-btn")?.addEventListener("click", login);
}

function showLogout(email) {
  document.getElementById("menu").innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle bg-opacity-0 text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        ${email}
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown"> 

        <li 
        data-bs-toggle="modal"
      data-bs-target="#deleteModal"
      id="delete-user-modal-btn-top" class="dropdown-item" style="cursor: pointer;">Slet bruger</li>
        <li><hr class="dropdown-divider"></li>
        <li id="logout-btn" class="dropdown-item" style="cursor: pointer;">Log ud</li>
      </ul>
    </li>
    <li class="nav-item">
  `;

  document.getElementById("logout-btn")?.addEventListener("click", logout);
}

async function saveResult() {
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;

  let member = tripInfo;
  member.password = password;
  member.email = email;

  const memberURL = apiURL + "/member";

  // member = body
  const options = makeOptions("POST", member, false);

  try {
    await fetch(memberURL, options).then(handleHttpErrors);
    document.getElementById("status-create-member").innerText =
      "Bruger oprettet";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  } catch (error) {
    document.getElementById("status-create-member").innerText = error.message;
  }
}

function sleepingBagFormSend() {
  try {
    const environmentTemperatureMin =
      document.getElementById("temp-value")?.textContent;

    if (environmentTemperatureMin?.length !== 0) {
      tripInfo.environmentTemperatureMin = environmentTemperatureMin;
    }
  } catch (error) {}

  try {
    const minCost = document.getElementById("price-value-min")?.textContent;

    if (minCost?.length !== 0) {
      tripInfo.minCost = minCost;
    }
  } catch (error) {}

  try {
    const maxCost = document.getElementById("price-value-max")?.textContent;

    if (maxCost?.length !== 0) {
      tripInfo.maxCost = maxCost;
    }
  } catch (error) {}

  try {
    const isFemale =
      document.querySelector('input[name="gender"]:checked').value === "female"
        ? "true"
        : "false";
    tripInfo.isFemale = isFemale;
  } catch (error) {}

  try {
    const isColdSensitive =
      document.querySelector('input[name="cold"]:checked').value === "true"
        ? "true"
        : "false";
    tripInfo.isColdSensitive = isColdSensitive;
  } catch (error) {}

  try {
    const innerMaterial =
      document.querySelector('input[name="fill"]:checked').value === "fiber"
        ? "Fiber"
        : "Dun";
    tripInfo.innerMaterial = innerMaterial;
  } catch (error) {}

  try {
    const personHeight = document.getElementById("height").value;

    if (personHeight?.length !== 0) {
      tripInfo.personHeight = personHeight;
    }
  } catch (error) {}

  try {
    const isInStore = document.getElementById("not-wider");

    if (isInStore.checked) {
      tripInfo.isInStore = "true";
    }
  } catch (error) {}

  fetchFilteredSleepingBags(tripInfo);
}

async function login() {

  const username = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  let member = { username, password };

  const URL = apiURL + "/auth/login";

  const options = makeOptions("POST", member, false);

  try {
    const response = await fetch(URL, options).then(handleHttpErrors);
    localStorage.setItem("user", response.username);
    localStorage.setItem("token", response.token);
    localStorage.setItem("roles", response.roles);

    const genericModalEl = document.getElementById("loginModalBox");
    const modal = bootstrap.Modal.getInstance(genericModalEl);
    modal.hide();
    getMember();

    document.querySelector("#login-email").value = "";
    document.querySelector("#login-password").value = "";

    showLogout(username);
  } catch (err) {
    //setStatusMsg("Login failed", true);
  }
}

function logout() {
  localStorage.clear();
  showLogin();
}

async function deleteUserById() {
  try {
    const memberToDelete = localStorage.getItem("user");

    console.log(memberToDelete);

    if (memberToDelete === "") {
      document.querySelector(
        "#status-delete"
      ).innerText = `No member found to delete`;
      return;
    }

    const options = makeOptions("DELETE", null, true);

    const URL = apiURL + "/member"
    
    await fetch(URL, options).then(handleHttpErrors)
    localStorage.clear()
    document.querySelector("#status-delete").innerText = `Bruger ${memberToDelete} er slettet`
    document.querySelector("#delete-user-question").innerText = ""
    showLogin()
  } catch (err) {
    document.querySelector("#status-delete").innerText = `api-fejl`;
  }

  document
    .querySelector("#close-delete-modal")
    ?.addEventListener("click", () => {
      document.querySelector("#status-delete").innerText = "";
    });
}

function adjustTempValue() {
  const temp = document.getElementById("temp-value");
  temp.textContent = this.value;
}

function adjustPriceValueMin() {
  const priceMin = document.getElementById("price-min");
  const priceMax = document.getElementById("price-max");

  // Ensure minimum value is not higher than maximum value
  if (
    parseInt(priceMin.value) > parseInt(priceMax.value) ||
    parseInt(priceMax.value) === parseInt(priceMin.value)
  ) {
    priceMax.value = priceMin.value + 500;
  }

  document.getElementById("price-value-min").textContent = priceMin.value;
  document.getElementById("price-value-max").textContent = priceMax.value;
}

function adjustPriceValueMax() {
  const priceMin = document.getElementById("price-min");
  const priceMax = document.getElementById("price-max");

  // Ensure maximum value is not lower than manimum value
  if (
    parseInt(priceMax.value) < parseInt(priceMin.value) ||
    parseInt(priceMax.value) === parseInt(priceMin.value)
  ) {
    priceMin.value = priceMax.value - 500;
  }

  document.getElementById("price-value-min").textContent = priceMin.value;
  document.getElementById("price-value-max").textContent = priceMax.value;
}

function showMultipleSleepingBags() {
  document.getElementById("sort-btn-row").innerHTML = `
  <div class="col-lg-4 ms-auto">
    <label for="sort">Sorter:</label>
    <select id="sort-select" name="sort" class="form-select">
        <option value="sortCostLowFirst" selected>Pris (laveste først)</option>
        <option value="sortCostHighFirst">Pris (højeste først)</option>
        <option value="sortWeightLowFirst">Vægt (laveste først)</option>
      </select>
  </div>
  `;

  document
    .getElementById("sort-select")
    ?.addEventListener("change", sortChangeEventListener);

  sleepingBags.sort(compareSleepingBagCostLowFirst);

  showMultipleSleepingBagsResult();
}

function showMultipleSleepingBagsResult() {
  const tableRowsArray = sleepingBags.map(
    (sleepingBag) => `
  <div class="col">
    <div class="card m-2">
      <a style="display:grid; justify-content:center;" href="https://www.friluftsland.dk/msearch?q=${sanitizeStringWithTableRows(
        sleepingBag.sku
      )}" target="_blank">
        <img class="card-img-top" src="${sanitizeStringWithTableRows(
          sleepingBag.imageURL
        )}" alt="Image" style="width:200px">
      </a>
      <div class="card-body">
        <a class="text-black" style="text-decoration: none;" href="https://www.friluftsland.dk/msearch?q=${sanitizeStringWithTableRows(
          sleepingBag.sku
        )}" target="_blank">
          <h6 style="font-weight: bolder;" class="card-title">${sanitizeStringWithTableRows(
            sleepingBag.brand
          )} ${sanitizeStringWithTableRows(sleepingBag.model)}</h6>
        </a>
        <h6 class="card-text">Pris: ${sanitizeStringWithTableRows(
          sleepingBag.cost
        )}</h6>
        <h6 class="card-text">Vægt: ${sanitizeStringWithTableRows(
          sleepingBag.productWeight
        )}</h6>

        <button type="button" class="btn btn-sm btn-dark" style="background-color: #00461c;" 
        data-sku="${sanitizeStringWithTableRows(sleepingBag.sku)}"
        data-action="details"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal">Se mere</button> 
        
      </div>
    </div>
  </div>`
  );

  document.getElementById("sleeping-bags-result").onclick = showSleepingBagDetails;

  const tableRowsString = tableRowsArray.join("\n");
  document.getElementById("sleeping-bags-result").innerHTML = tableRowsString;
}

function sortChangeEventListener(event) {
  if (event.target.value == "sortCostLowFirst") {
    sleepingBags.sort(compareSleepingBagCostLowFirst);
  } else if (event.target.value == "sortCostHighFirst") {
    sleepingBags.sort(compareSleepingBagCostHighFirst);
  } else if (event.target.value == "sortWeightLowFirst") {
    sleepingBags.sort(compareSleepingBagWeightLowFirst);
  }
  showMultipleSleepingBagsResult();
}

function compareSleepingBagCostLowFirst(sleepingBag1, sleepingBag2) {
  if (sleepingBag1.cost < sleepingBag2.cost) {
    return -1;
  } else if (sleepingBag1.cost > sleepingBag2.cost) {
    return 1;
  } else {
    return 0;
  }
}

function compareSleepingBagCostHighFirst(sleepingBag1, sleepingBag2) {
  if (sleepingBag1.cost > sleepingBag2.cost) {
    return -1;
  } else if (sleepingBag1.cost < sleepingBag2.cost) {
    return 1;
  } else {
    return 0;
  }
}

function compareSleepingBagWeightLowFirst(sleepingBag1, sleepingBag2) {
  if (sleepingBag1.productWeight < sleepingBag2.productWeight) {
    return -1;
  } else if (sleepingBag1.productWeight > sleepingBag2.productWeight) {
    return 1;
  } else {
    return 0;
  }
}

async function showSleepingBagDetails(event) {
  const target = event.target;
  if (target.dataset.action == "details") {
    const sku = target.dataset.sku;
    const sleepingBag = sleepingBags.find((element) => element.sku == sku);

    // bootstrap 5 modal
    document.querySelector("#exampleModalLabel").innerText =
      "Information om sovepose:";

    document.querySelector("#modal-body").innerText = `
      Mærke: ${sleepingBag.brand}
      Produktnavn: ${sleepingBag.model}
      Pris: ${sleepingBag.cost}
      Personlængde: ${sleepingBag.personHeight}
      Komforttemp.(°C): ${sleepingBag.comfortTemp}
      Lower limit. (°C): ${sleepingBag.lowerLimitTemp}
      Fyld: ${sleepingBag.innerMaterial}
      Vægt (g): ${sleepingBag.productWeight}
      Lagerstatus: ${sleepingBag.stockLocation}
      Varenr: ${sleepingBag.sku}
      `;

    // Generate link to the sleepingbag at Friluftslands homepage
    const link = generateLink(sleepingBag.sku);
    document.querySelector("#modal-link").innerHTML = link;
  }
}

function generateLink(sku) {
  return `<a href="https://www.friluftsland.dk/msearch?q=${sku}" target="_blank">Link</a>`;
}

async function fetchFilteredSleepingBags(tripObj) {
  const options = makeOptions("POST", tripObj, false);

  try {
    const filteredResult = await fetch(URL, options).then(handleHttpErrors);
    sleepingBags = filteredResult;
    showMultipleSleepingBags();
  } catch (err) {
    // setStatusMsg("Error", true);
  }
}
