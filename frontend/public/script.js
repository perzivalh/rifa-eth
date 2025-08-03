// --- Código ya existente (toggleDescription, countdown, progress) ---

function toggleDescription() {
    const expandedDesc = document.getElementById('expandedDesc');
    const viewMore = document.querySelector('.view-more');

    if (expandedDesc.style.display === 'none' || expandedDesc.style.display === '') {
        expandedDesc.style.display = 'block';
        viewMore.textContent = 'view less';
    } else {
        expandedDesc.style.display = 'none';
        viewMore.textContent = 'view more';
    }
}

function updateCountdown() {
    const targetDate = new Date("2025-08-10T23:59:59Z");
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (distance > 0) {
        document.getElementById('countdown').innerHTML =
            `${days} DAYS: ${hours}H: ${minutes}M: ${seconds}S`;
    } else {
        document.getElementById('countdown').innerHTML = "FINALIZADO";
    }
}

function updateProgress(currentAmount, targetAmount) {
    if (targetAmount === 0) return; // evita división por 0
    const percentage = (currentAmount / targetAmount) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// Llama al cronómetro cada 1s
setInterval(updateCountdown, 1000);
updateCountdown();

// ----------------------------------

// Configura tu RPC público para lectura sin pedir wallet
const RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"; // cambia esto por tu Infura/Alchemy/etc key
const publicProvider = new ethers.providers.JsonRpcProvider(RPC_URL);

// ABI y dirección del contrato
const contractABI = [
  "function buyTickets(uint256 _quantity, string memory _username) payable",
  "function goal() view returns (uint256)",
  "function totalRaised() view returns (uint256)"
];
const contractAddress = "0xF83B4fAE4D72Beba77BfCA189B8a9F17BCba3825";

async function fetchAndUpdateProgress() {
  try {
    const contract = new ethers.Contract(contractAddress, contractABI, publicProvider);

    const goal = await contract.goal();
    const raised = await contract.totalRaised();

    const goalEth = Number(ethers.utils.formatEther(goal));
    const raisedEth = Number(ethers.utils.formatEther(raised));

    updateProgress(raisedEth, goalEth);

    document.getElementById('ethLabel').textContent = `${raisedEth.toFixed(3)} / ${goalEth} ETH`;
  } catch (error) {
    console.error("Error al obtener progreso:", error);
  }
}

// Llamamos al cargar la página y cada 30 segundos
fetchAndUpdateProgress();
setInterval(fetchAndUpdateProgress, 30000);

// -----------------------------------

// Variables globales para usar cuando conecten wallet
let provider;
let signer;

// Función para conectar wallet solo cuando se clickee PARTICIPAR
async function connectWallet() {
  try {
    if (!window.ethereum) {
      showNotification("🦊 Instala Metamask para continuar.", "error");
      return false;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("Wallet conectada:", address);
    showNotification("✅ Wallet conectada: " + address.slice(0, 6) + "...", "success");
    return true;
  } catch (error) {
    console.error("Error al conectar la wallet:", error);
    showNotification("❌ Error al conectar la wallet: " + error.message, "error");
    return false;
  }
}

// Función llamada al clicar en PARTICIPAR
async function participate() {
  const connected = await connectWallet();
  if (!connected) return;

  // Redirige a la página del formulario después de conectar wallet
  window.location.href = "form/form.html";
}

// Función para mostrar notificaciones
function showNotification(message, type = "success") {
  const container = document.getElementById("notifications-container");

  const notif = document.createElement("div");
  notif.className = `notification animated ${type}`;
  notif.innerText = message;

  container.appendChild(notif);

  // Activar animación con un pequeño delay
  setTimeout(() => {
    notif.classList.add("show");
  }, 100);

  // Quitar después de 4s
  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 400);
  }, 4000);
}


