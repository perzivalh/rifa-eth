// Configuración
const TICKET_PRICE = 0.00001; // Precio por ticket en ETH
const MIN_TICKETS = 1;
const MAX_TICKETS = 100;

const contractAddress = "0x04e63b4Ef4732bED02DdAef0544963ECbd1F2c19";
const contractABI = [
  "function buyTickets(uint256 _quantity, string memory _username) payable",
  "function goal() view returns (uint256)",
  "function totalRaised() view returns (uint256)"
];

let currentQuantity = 1;
const quantityDisplay = document.getElementById('quantity');
const totalPriceDisplay = document.getElementById('totalPrice');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const usernameInput = document.getElementById('username');

function updateDisplay() {
  quantityDisplay.textContent = currentQuantity;
  const totalPrice = (currentQuantity * TICKET_PRICE).toFixed(5);
  totalPriceDisplay.textContent = `${totalPrice} ETH`;
  decreaseBtn.disabled = currentQuantity <= MIN_TICKETS;
  increaseBtn.disabled = currentQuantity >= MAX_TICKETS;
}

function decreaseQuantity() {
  if (currentQuantity > MIN_TICKETS) {
    currentQuantity--;
    updateDisplay();
  }
}

function increaseQuantity() {
  if (currentQuantity < MAX_TICKETS) {
    currentQuantity++;
    updateDisplay();
  }
}

// ✅ FUNCIONAL CON ETHERS V5 Y METAMASK EN SEPOLIA
async function buyTickets() {
  const username = usernameInput.value.trim();
  const quantity = currentQuantity;

  if (!username || username.length < 3) {
    showNotification("⚠️ Ingresa un username válido de al menos 3 caracteres", "error");
    return;
  }

  if (typeof window.ethereum === 'undefined') {
    showNotification("🦊 Necesitas MetaMask para continuar", "error");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const raffleContract = new ethers.Contract(contractAddress, contractABI, signer);

    const ticketPrice = ethers.utils.parseEther(TICKET_PRICE.toString());
    const totalCost = ticketPrice.mul(quantity);

    const tx = await raffleContract.buyTickets(quantity, username, {
      value: totalCost
    });

    showNotification("⏳ Transacción enviada. Esperando confirmación...", "success");

    await tx.wait();

    showNotification("🎉 ¡Compra completada con éxito!", "success");
  } catch (error) {
    console.error(error);

    // Cancelación por el usuario
    if (error.code === 4001) {
      showNotification("❌ Transacción cancelada por el usuario", "error");
    }
    // Error por fondos insuficientes
    else if (error.message.includes("insufficient funds")) {
      showNotification("💸 Fondos insuficientes para completar la compra", "error");
    }
    // Otro error (fallback)
    else {
      showNotification("❌ Transacción cancelada por el usuario" , "error");
    }
  }
}


decreaseBtn.addEventListener('click', decreaseQuantity);
increaseBtn.addEventListener('click', increaseQuantity);

usernameInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    buyTickets();
  }
});

usernameInput.addEventListener('input', function (e) {
  this.value = this.value.replace(/[^a-zA-Z0-9_.-]/g, '');
});

updateDisplay();

function showNotification(message, type = "success") {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      container.removeChild(notification);
    }, 500);
  }, 3000);
}

