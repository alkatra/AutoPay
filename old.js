router.get("/test/cookie", async function (req, res) {
  console.log(req.session);
  res.send("Yes");
});
router.get("/test/find", async function (req, res) {
  let response = await User.find({});
  res.status(200).send(response);
});
router.get("/test/crud", async function (req, res) {
  const testUser = new User();
  testUser.username = "sagartest";
  testUser.password = "test";
  try {
    await testUser.save();
  } catch (e) {
    res.status(500).send("Unable to create test user.");
  }

  let response = await User.find({ username: "sagartest" });
  if (response.length == 0) {
    res.status(404).send({
      message: "Unable to find test user.",
    });
  } else {
    let response = await User.deleteOne({ username: "sagartest" });
    if (response.deletedCount == 1) {
      res.status(200).send({ message: "Ran all operations successfully." });
    } else {
      res.status(500).send({ message: "Server Error." });
    }
  }
});
router.get("/test/bcrypt", async function (req, res) {
  const testUser = new User();
  testUser.username = "sagar";
  try {
    testUser.password = await bcrypt.hash("password", 10);
    await testUser.save();
  } catch (e) {
    res.status(500).send("Unable to hash/create test user.");
  }
  let response = await User.find({ username: "sagartestb" });
  if (response.length == 0) {
    res.status(404).send({
      message: "Unable to find test user.",
    });
  } else {
    bcrypt.compare(
      "password",
      response[0].password,
      async function (err, resp) {
        if (err) {
          res.status(500).send({ message: "Server Error." });
        }
        if (resp) {
          // await User.deleteOne({ username: "sagartestb" });
          res.status(200).send({ message: "Ran all operations successfully." });
        } else {
          await User.deleteOne({ username: "sagartestb" });
          res.status(403).send({ message: "Incorrect Password." });
        }
      }
    );
  }
});
