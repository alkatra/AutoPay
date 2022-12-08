let paymentList = [];
const IP = "www.alkatra.com";

async function loadClients() {
  let results = await fetch("https://" + IP + "/api/clients");
  paymentList = await results.json();
  // console.log(json);
  if (paymentList.length == 0) {
    document.getElementById("client-list").innerHTML =
      "You don't have any clients yet. Do you want to add your first one?";
  } else {
    let string =
      "<table class='table'><thead><tr><th>Name</th><th>Total Paid</th><th>Manage</th></tr></thead><tbody>";
    paymentList.forEach((e, i) => {
      string +=
        "<tr><td>" +
        e.name +
        "</td><td>$" +
        e.totalSuccess / 100 +
        "</td><td><button class='button is-link' onclick='manageClient(" +
        i +
        ")'>Manage</button></td></tr>";
    });
    string += "</tbody></table>";
    document.getElementById("client-list").innerHTML = string;
  }
}

loadClients();

function addClientRedirect() {
  window.location.href = "/addclient";
}

function manageClient(index) {
  window.location.href = "/manage/" + paymentList[index]._id;
}

function logout() {
  window.location.href = "/logout";
}

function paymentLogs() {
  window.location.href = "/paymentlogs";
}
