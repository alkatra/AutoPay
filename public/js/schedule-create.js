const id = window.location.href.split("/").pop();

function addSchedule() {
  let firstAmount = $(`#firstAmount`).val();
  let firstDate = $(`#firstDate`).val();
  let recurring = $(`#recurring`).val();
  let timesRecurring = $(`#timesRecurring`).val();
  if (recurring == "once" && timesRecurring != 1) {
    document.getElementById(`timesRecurringError`).innerText =
      "ERROR: Please set this to 1 if you selected one time recurring frequency.";
    document.getElementById(`timesRecurringError`).classList.add("is-danger");
    return;
  }
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  if (Date.parse(firstDate) < Date.parse(date)) {
    document.getElementById(`dateError`).innerText =
      "ERROR: Must be today or onwards!";
    document.getElementById(`dateError`).classList.add("is-danger");
    return;
  }

  let payment = {
    amount: firstAmount * 100,
    startDate: firstDate,
    paymentFrequency: recurring,
    timesRecurringLeft:
      recurring != "once" && timesRecurring == 0 ? -1 : timesRecurring,
    ignoreLastPayment: false,
  };

  fetch("http://localhost/api/payment/schedule", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientID: id,
      payment,
    }),
  }).then(async (response) => {
    response = await response.json();
    location.href = "http://localhost/dash";
  });
}

function optionSelected(value) {
  if (value == "once") {
    document.getElementById(`timesRecurring`).value = 1;
    document.getElementById(`timesRecurringDiv`).style.display = "none";
  } else {
    document.getElementById(`timesRecurring`).value = 0;
    document.getElementById(`timesRecurringDiv`).style.display = "block";
  }
}

document.getElementById(`timesRecurringDiv`).style.display = "none";
