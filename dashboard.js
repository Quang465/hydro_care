let devices = [];
let selected = null;

function addDevice() {
  const input = document.getElementById("espInput");
  const espId = input.value.trim();

  if (espId && !devices.includes(espId)) {
    devices.push(espId);
    renderDevices();
    input.value = "";
  }
}

function removeDevice(id) {
  devices = devices.filter(dev => dev !== id);
  if (selected === id) {
    selected = null; // nếu card đang mở thì reset
  }
  renderDevices();
}

function renderDevices() {
  const grid = document.getElementById("deviceGrid");
  grid.innerHTML = "";

  devices.forEach(id => {
    const card = document.createElement("div");
    card.className = "card";

    // tiêu đề + nút delete
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";

    const title = document.createElement("h3");
    title.textContent = "ESP ID: " + id;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.background = "transparent";
    delBtn.style.border = "none";
    delBtn.style.cursor = "pointer";
    delBtn.onclick = (e) => {
      e.stopPropagation(); // tránh trigger click card
      removeDevice(id);
    };

    header.appendChild(title);
    header.appendChild(delBtn);
    card.appendChild(header);

    // click vào card để hiện chi tiết
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
