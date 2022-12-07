const IP = "alkatra.com";

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
        ).innerHTML = `<span class="is-success">Card Successfully Saved.</span><br/>You may close this window now.`;
      }
    });
}

const id = window.location.href.split("/").pop();
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
    document.getElementById("add-here").innerHTML = string;
  });
});
