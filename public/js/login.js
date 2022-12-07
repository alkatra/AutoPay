// make sure username is not repeatable

var curUser = JSON.parse(localStorage.getItem("curUser")) || "";

const API_URL = "http://localhost:3000/api";

var rooms = [];

$("#signup-redirect").on("click", () => {
  location.href = "/signup";
});

function invalidDetails() {
  $("#user-not-found").append(`
      <div class='alert alert-danger' role='alert'>User details incorrect/nonexistent, try again.</div>`);
}

function login() {
  const username = $("#username").val();
  const password = $("#password").val();
  console.log(username, password);
  fetch("http://localhost/api/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  }).then((response) => {
    location.reload();
  });
}
