const IP = "www.alkatra.com";
let paymentList = [];
async function loadPayments() {
  let results = await fetch("https://" + IP + "/api/payment/logs");
  paymentList = await results.json();
  console.log(paymentList);
  if (paymentList.length == 0) {
    document.getElementById("paymentlist").innerHTML =
      "You don't have any payments yet.";
  } else {
    let string =
      "<table class='table'><thead><tr><th>Name</th><th>Amount</th><th>Status</th><th>Date</th><th>Refund</th></tr></thead><tbody>";
    paymentList.forEach((e, i) => {
      string +=
        "<tr><td>" +
        e.name +
        "</td><td>$" +
        e.amount / 100 +
        `</td><td><span class='tag is-${
          e.gatewayResponseMessage == "Transaction successful"
            ? "success"
            : "danger"
        }'>` +
        e.gatewayResponseMessage +
        "</span></td><td>" +
        new Date(e.createdAt).toISOString().substring(0, 10) +
        `</td><td><button class='button is-danger' onclick='refund(${i})'>Refund</button></td></tr>`;
    });
    string += "</tbody></table>";
    document.getElementById("paymentlist").innerHTML = string;
  }
}

function refund(i) {
  console.log(
    paymentList[i].orderId,
    paymentList[i].ip,
    paymentList[i].amount,
    paymentList[i].clientID,
    paymentList[i].paymentID
  );
}

window.onload = function () {
  loadPayments();
};
