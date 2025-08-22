let devices = JSON.parse(localStorage.getItem("devices")) || [];
let selected = null;

function addDevice() {
  const input = document.getElementById("espInput");
  const espId = input.value.trim();

  if (espId && !devices.includes(espId)) {
    devices.push(espId);
    saveDevices();
    renderDevices();
    input.value = "";
  }
}

function removeDevice(id) {
  devices = devices.filter(dev => dev !== id);
  if (selected === id) selected = null;
  saveDevices();
  renderDevices();
}

function saveDevices() {
  localStorage.setItem("devices", JSON.stringify(devices));
}

function renderDevices() {
  const grid = document.getElementById("deviceGrid");
  grid.innerHTML = "";

  devices.forEach(id => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.position = "relative"; // để đặt nút X

    // tiêu đề ESP
    const title = document.createElement("h3");
    title.textContent = "ESP ID: " + id;
    title.style.margin = "0";
    card.appendChild(title);

    // nút delete rõ ràng
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation(); // tránh click card
      removeDevice(id);
    };
    card.appendChild(delBtn);

    // click card để xem chi tiết
    card.onclick = () => {
      selected = selected === id ? null : id;
      renderDevices();
    };

    if (selected === id) {
      const details = document.createElement("div");
      details.className = "details";
      details.innerHTML = `
        <p>TDS: 120 ppm</p>
        <p>Temperature: 25°C</p>
        <p>pH: 7.2</p>
        <p>Turbidity: 3 NTU</p>
      `;
      card.appendChild(details);
    }

    grid.appendChild(card);
  });
}

// render lần đầu khi load
renderDevices();
