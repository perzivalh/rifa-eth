// Configuración
const TICKET_PRICE = 0.0001; // Precio por ticket en ETH
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
  const totalPrice = (currentQuantity * TICKET_PRICE).toFixed(4);
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
    alert("Ingresa un username válido de al menos 3 caracteres");
    return;
  }

  if (typeof window.ethereum === 'undefined') {
    alert("Necesitas MetaMask para continuar");
    return;
  }

  try {
    // Conectar a MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const raffleContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    const ticketPrice = ethers.utils.parseEther(TICKET_PRICE.toString());
    const totalCost = ticketPrice.mul(quantity);

    const tx = await raffleContract.buyTickets(quantity, username, {
      value: totalCost
    });

    alert("Transacción enviada, espera confirmación...");
    await tx.wait();
    alert("¡Compra exitosa!");
  } catch (error) {
    console.error(error);
    alert("Error al comprar tickets: " + (error.data?.message || error.message));
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
