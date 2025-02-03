let userData;

fetch("naflan.json")
    .then(response => response.json())
    .then(data => {
        userData = data;
        displayUserData();
    })

function displayUserData() {
    const displayElement = document.getElementById("user-data");
    const formattedData = JSON.stringify(userData, null, 2);
    displayElement.textContent = formattedData;
}