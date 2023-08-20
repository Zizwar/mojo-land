document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = {};

  for (let [name, value] of formData.entries()) {
    data[name] = value;
  }
  console.log("start",{ data });
  fetch("api/mojo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log({ data });
      // Handle response from the API
    })
    .catch((error) => {
      console.log({ error });
      // Handle error
    });
});
