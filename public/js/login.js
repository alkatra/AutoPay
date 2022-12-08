// make sure username is not repeatable
const IP = "www.alkatra.com";

var curUser = JSON.parse(localStorage.getItem("curUser")) || "";

function invalidDetails() {
  document.getElementById("user-not-found").innerHTML = `
      <span class='tag is-danger' role='alert'>User details incorrect/nonexistent, try again.</div>`;
}

function login() {
  const username = $("#username").val();
  const password = $("#password").val();

  fetch("https://" + IP + "/api/login", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://www.alkatra.com",
    },
    body: JSON.stringify({ username: username, password: password }),
  }).then((response) => {
    if (response.status == 200) {
      location.reload();
    } else {
      invalidDetails();
    }
  });
}
