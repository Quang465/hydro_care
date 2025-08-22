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

function renderDevices() {
  const grid = document.getElementById("deviceGrid");
  grid.innerHTML = "";

  devices.forEach(id => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>ESP ID: ${id}</h3>`;

    // click vào card để mở dữ liệu
    card.onclick = () => {
      selected = selected === id ? null : id;
      renderDevices();
    };

    if (selected === id) {
      const details = document.createElement("div");
      details.className = "details";
      // dữ liệu giả lập (mock)
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
