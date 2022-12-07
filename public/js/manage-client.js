const id = window.location.href.split("/").pop();
const IP = "alkatra.com";

let paymentsG = [];
let clientID = "";
fetch("http://" + IP + "/api/client/" + id)
  .then((response) => response.json())
  .then((response) => {
    console.log(response);
    clientID = response._id;
    let string = "";
    if (response == { message: "Something went wrong" }) {
      string = `<h1 class="title is-primary">
        Client Management
      </h1></br>
      <p class="subtitle">
        Your client has not entered their payment details yet.
      </p>`;
    } else {
      string = `<h1 class="title is-primary">
        Client Management
      </h1></br>
      <p class="subtitle">
        Here are details about your client: <strong>${
          response.name
        }</strong><br/>
        Total paid up till now: <strong>$${response.totalSuccess / 100}</strong>
      </p>
        <div class="columns">
    
      <div class="column is-one-third"><div class="card has-background-link-light">
      <header class="card-header">
        <p class="card-header-title">
          Information
        </p>
      </header>
      <div class="card-content">
      <b>Name: </b> ${response.name} <br/>
      <b>Service Offered: </b> ${response.itemName} <br/>
      <b>Phone Number: </b> ${response.number}

      </div></div>      <br/><div style="text-align: center;"><button class="button is-link is-center" onclick="addSchedule()">Add another Schedule</button></div></div>`;
      if (response.payments == undefined) {
        console.log("ERROR");
      } else {
        paymentsG = response.payments;
        response.payments.forEach((e, i) => {
          let lastPayment, lastAttempted;
          try {
            lastPayment = new Date(e.lastPayment)
              .toISOString()
              .substring(0, 10);
            lastAttempted = new Date(e.lastAttempted)
              .toISOString()
              .substring(0, 10);
          } catch {
            lastPayment =
              "<span class='tag is-info'>Starting on</span> " + lastPayment;
            lastAttempted = e.lastAttempted;
          }
          if (e.ignoreLastPayment)
            lastPayment =
              lastAttempted +
              ", but <span class='tag is-info'>Restarting on</span> " +
              new Date(e.startDate).toISOString().substring(0, 10);
          if (i == 2 || i == 5 || i == 8 || i == 11) {
            string += `</div><div class="columns">`;
          }
          string += ` <div class="column is-one-third"> <div class="card has-background-link-light">
                <header class="card-header">
                  <p class="card-header-title">
                    Payment Schedule
                  </p>
                </header>
                <div class="card-content">
                <b>Amount: </b> $${e.amount / 100} <br/>
                <b>Payment Frequency: </b> ${e.paymentFrequency} <br/>
                <b>Number of Payments Left: </b> ${
                  e.timesRecurringLeft < 0
                    ? `<span class="tag is-info">Infinite</span>`
                    : e.timesRecurringLeft == 0
                    ? `<span class="tag is-danger">Finished (0)</span>`
                    : e.timesRecurringLeft
                } <br/>
                <b>Number of Successful Payments: </b> ${e.successCount} <br/>
                <b>Last  Successful Payment on: </b> ${lastPayment} <br/><br/>
                <b>Last Payment Attempted: </b> ${lastAttempted} <br/>
                <b>Attempt Status: </b> 
                <span class="tag is-${
                  e.lastStatus == "Transaction successful"
                    ? "success"
                    : "danger"
                }">
                ${e.lastStatus}
              </span><br/><br/> 
              <div id="dateinput${i}">${
            e.timesRecurringLeft != 0
              ? `<div class="buttons"><button class="button is-info is-small" onclick="changeDate(${i})">Change Date of next Payment</button>
              <button class="button is-link is-small" onclick="changeAmount(${i})">Change Amount of next Payment</button>
              <button class="button is-danger is-small" onclick="stopPayments(${i})">Stop further payments</button></div>`
              : ""
          }</div>
              
                </div></div></div>`;
        });
      }
      string += "</div>";
      //   $("#main").append(`</div`);
    }
    $("#main").append(string);
  });

function changeDate(i) {
  console.log(paymentsG[i]);
  document.getElementById(`dateinput${i}`).innerHTML = `<div class="field">
    <label class="label">Date of New Payment</label>
  <div class="control">
    <input type="date" id="dateinputx${i}">
    <p class="help" id="dateError1">Must be today or onwards. This will be shifted further if your client fails to pay today. The schedule will be affected accordingly.</p>
  </div>
  <button class="button is-info" onclick="submitDate(${i})">Change</button></div>
</div>`;
}

function changeAmount(i) {
  console.log(paymentsG[i]);
  document.getElementById(
    `dateinput${i}`
  ).innerHTML = `        <div class="field">
  <label class="label">Amount of Payment (AUD $)</label>
  <div class="control">
    <input class="input" type="number" placeholder="100" id="amountinputx${i}">
  </div>
  <p class="help">The amount of next payments to be taken out.</p>
  <button class="button is-info" onclick="submitAmount(${i})">Change</button></div>
</div>`;
}

async function submitAmount(i) {
  let response = await fetch("http://" + IP + "/api/payment/changeamount", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientID: clientID,
      paymentID: paymentsG[i]._id,
      newAmount: document.getElementById(`amountinputx${i}`).value,
    }),
  });
  location.reload();
  console.log(await response.json());
}

async function submitDate(i) {
  let response = await fetch("http://" + IP + "/api/payment/changedate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientID: clientID,
      paymentID: paymentsG[i]._id,
      newDate: document.getElementById(`dateinputx${i}`).value,
    }),
  });
  location.reload();
  console.log(await response.json());
}

async function stopPayments(i) {
  let response = await fetch("http://" + IP + "/api/payment/stoppayments", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientID: clientID,
      paymentID: paymentsG[i]._id,
    }),
  });
  location.reload();
  console.log(await response.json());
}

async function addSchedule() {
  location.href = "http://localhost/schedule/" + clientID;
}
