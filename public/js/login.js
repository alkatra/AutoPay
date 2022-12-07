// make sure username is not repeatable
const IP = "alkatra.com";

var curUser = JSON.parse(localStorage.getItem("curUser")) || "";

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
    console.log(response);
    location.reload();
  });
}
