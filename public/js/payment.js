const IP = "www.alkatra.com";

function postTokenisedCard(tokenisedCard) {
  fetch("https://" + IP + "/api/payment/token/" + id, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tokenisedCard),
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      if (response.message == "Success") {
        document.getElementById(
          "add-here"
        ).innerHTML = `<span class="tag is-success">Card Successfully Saved.</span><br/>You may close this window now.`;
      } else {
        addError(response);
      }
    });
}

function addError(errors) {
  clearDiv();
  getPaymentInformation();
  document.getElementById(
    "add-here"
  ).innerHTML += `<span class="tag is-danger">Something went wrong.</span><br/>${errors.forEach(
    (e) => {
      e + "<br/>";
    }
  )}`;
}

function clearDiv() {
  document.getElementById("add-here").innerHTML = "";
}

function submitClicked() {
  document.getElementById(
    "add-here"
  ).innerHTML = `<span class="tag is-warning">Attempting...</span>`;
  mySecurePayUI.tokenise();
}

const id = window.location.href.split("/").pop();

function getPaymentInformation() {
  fetch("https://" + IP + "/api/payment/paymentinformation/" + id).then((r) => {
    r.json().then((r) => {
      let string = "";
      string += `
          Your name: <strong>${r.name}</strong><br/>
          Your number: <strong>${r.number}</strong><br/>
          Service Offered: <strong>${r.itemName}</strong><br/><br/>
          <h2 class="is-2">You are paying:</h2><ul>`;
      r.paymentSchedules.forEach((e, i) => {
        string += `<li>${e}</li>`;
      });
      string += "</ul>";
      document.getElementById("add-here").innerHTML += string;
    });
  });
}

getPaymentInformation();
