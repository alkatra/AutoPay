let schedules = 1;
const IP = "www.alkatra.com";
function addClientRedirect() {
  const name = document.getElementById("name").value;
  const number = document.getElementById("number").value;
  const itemName = document.getElementById("itemName").value;

  let payments = [];

  for (let i = 1; i <= schedules; i++) {
    let firstAmount = $(`#firstAmount${i}`).val();
    let firstDate = $(`#firstDate${i}`).val();
    let recurring = $(`#recurring${i}`).val();
    let timesRecurring = $(`#timesRecurring${i}`).val();
    if (recurring == "once" && timesRecurring != 1) {
      document.getElementById(`timesRecurringError${i}`).innerText =
        "ERROR: Please set this to 1 if you selected one time recurring frequency.";
      document
        .getElementById(`timesRecurringError${i}`)
        .classList.add("is-danger");
      return;
    }
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    if (Date.parse(firstDate) < Date.parse(date)) {
      document.getElementById(`dateError${i}`).innerText =
        "ERROR: Must be today or onwards!";
      document.getElementById(`dateError${i}`).classList.add("is-danger");
      return;
    }

    payments.push({
      amount: firstAmount * 100,
      startDate: firstDate,
      paymentFrequency: recurring,
      timesRecurringLeft:
        recurring != "once" && timesRecurring == 0 ? -1 : timesRecurring,
      ignoreLastPayment: false,
    });
  }

  if (number.length != 10 || number.substring(0, 2) != "04") {
    document.getElementById("numberError").innerText =
      "Please enter a valid number starting with 04.";
    document.getElementById("numberError").classList.add("is-danger");
    return;
  }
  fetch("https://" + IP + "/api/client", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      number,
      itemName,
      payments,
    }),
  }).then(async (response) => {
    response = await response.json();
    document.getElementById("main-container").innerHTML =
      '<h1 class="title is-primary">Client successfully added.</h1></br><p class="subtitle">Your client will need the following link to set up their debit card information: <br/><strong><a href="' +
      response.link +
      '">' +
      response.link +
      "</a></strong></p>";
  });
}

function optionSelected(value, schedule) {
  if (value == "once") {
    document.getElementById(`timesRecurring${schedule}`).value = 1;
    document.getElementById(`timesRecurringDiv${schedule}`).style.display =
      "none";
  } else {
    document.getElementById(`timesRecurring${schedule}`).value = 0;
    document.getElementById(`timesRecurringDiv${schedule}`).style.display =
      "block";
  }
}

function addSchedule() {
  schedules++;
  $("#schedule").append(`     <br/><h2 class="title is-primary">
  Schedule ${schedules}
</h2><div class="field">
  <label class="label">Amount of Payment (AUD $)</label>
  <div class="control">
    <input class="input" type="number" placeholder="100" id="firstAmount${schedules}">
  </div>
  <p class="help">The amount of first payment to be taken out.</p>
</div>
<div class="field">
  <label class="label">Date of First Payment</label>
  <div class="control">
  <input type="date" id="firstDate${schedules}">
  <p class="help" id="dateError${schedules}">Must be today or onwards. This will be shifted further if your client fails to pay today. The schedule will be affected accordingly.</p>
  </div>
</div>
<div class="field">
  <label class="label">Recurring Frequency:</label>
  <div class="control">
    <select name="recurring" id="recurring${schedules}" onchange="optionSelected(value, ${schedules})">
      <option value="once" >One time</option>
      <option value="weekly" >Weekly</option>
      <option value="fortnightly" >Fortnightly</option>
      <option value="monthly" >Monthly</option>
    </select>

  </div>
</div>
<div class="field" id="timesRecurringDiv${schedules}">
  <label class="label">Times Recurring:</label>
  <div class="control">
    <input class="input" type="number" id="timesRecurring${schedules}" value=1>
  </div>
  <p class="help" id="timesRecurringError${schedules}">Set 0 if you want infinite recurring. </p>
</div>`);
  document.getElementById(`timesRecurringDiv${schedules}`).style.display =
    "none";
}

document.getElementById(`timesRecurringDiv1`).style.display = "none";
