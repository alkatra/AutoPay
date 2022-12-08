const IP = "www.alkatra.com";
let paymentList = [];

async function loadPayments() {
  let results = await fetch("https://" + IP + "/api/logs");
  paymentList = await results.json();
  console.log(paymentList);
  if (paymentList.length == 0) {
    document.getElementById("loglist").innerHTML =
      "You don't have any logs yet.";
  } else {
    let string =
      "<table class='table'><thead><tr><th>Name</th><th>Date</th></tr></thead><tbody>";
    paymentList.forEach((e, i) => {
      string +=
        "<tr><td>" +
        e.message +
        `</td><td>` +
        new Date(e.date).toISOString().substring(0, 10) +
        `</td></tr>`;
    });
    string += "</tbody></table>";
    document.getElementById("loglist").innerHTML = string;
  }
}

window.onload = function () {
  loadPayments();
};
