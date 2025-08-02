// --- Código que ya tenías (toggleDescription, countdown, progress, etc.) ---

// Función para mostrar/ocultar descripción expandida
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

// Función del botón participar (conectar con backend)
function participate() {
    alert('Función de participación - conectar con backend');
    // Aquí conectarías con tu backend
}

// Cuenta regresiva (ejemplo - conectar con datos reales del backend)
function updateCountdown() {
    // Valores estáticos para demo
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    targetDate.setHours(targetDate.getHours() + 23);
    targetDate.setMinutes(targetDate.getMinutes() + 32);
    targetDate.setSeconds(targetDate.getSeconds() + 21);

    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = 
        `${days} DAYS: ${hours}H: ${minutes}M: ${seconds}S`;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = "FINALIZADO";
    }
}

// Actualizar progreso (conectar con backend)
function updateProgress(currentAmount, targetAmount) {
    const percentage = (currentAmount / targetAmount) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// Actualizar countdown cada segundo
setInterval(updateCountdown, 1000);
updateCountdown();

// Ejemplo de actualización de progreso (45% como en la imagen)
updateProgress(0.45, 1);

// --- Ahora empieza el código nuevo para conectar a Metamask y al contrato ---

// ABI mínimo para funciones que usaremos
const contractABI = [
  "function buyTickets(uint256 _quantity, string memory _username) payable",
  "function goal() view returns (uint256)",
  "function totalRaised() view returns (uint256)"
];

// Aquí pones la dirección del contrato desplegado
const contractAddress = "0xF83B4fAE4D72Beba77BfCA189B8a9F17BCba3825";

let provider;
let signer;
let raffleContract;

// Función para conectar Metamask y preparar contrato
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Instala Metamask para continuar.");
      return;
    }

    // Crear proveedor y solicitar acceso
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("Wallet conectada:", address);
    alert("Wallet conectada: " + address);
  } catch (error) {
    console.error("Error al conectar la wallet:", error);
    alert("Error al conectar la wallet: " + error.message);
  }
}


// Nueva función que se llama al hacer click en PARTICIPAR
async function participate() {
  const connected = await connectWallet();
  if (!connected) return;

  // Pedimos el username y cantidad (puedes cambiar esto a un formulario)
  const username = prompt("Ingresa tu username para la rifa:");
  if (!username) {
    alert("El username es obligatorio");
    return;
  }

  const quantityStr = prompt("¿Cuántas rifas quieres comprar? (precio 0.005 ETH cada una)");
  const quantity = Number(quantityStr);
  if (!quantity || quantity <= 0) {
    alert("Cantidad inválida");
    return;
  }

  try {
    const pricePerTicket = ethers.parseEther("0.005");
    const totalCost = pricePerTicket.mul(quantity);

    // Llamamos a la función del contrato pagando ETH
    const tx = await raffleContract.buyTickets(quantity, username, { value: totalCost });
    alert("Transacción enviada, espera confirmación...");

    await tx.wait(); // Esperar confirmación

    alert("¡Gracias por participar!");
  } catch (error) {
    alert("Error al comprar rifas: " + (error.data?.message || error.message));
  }
}

async function fetchAndUpdateProgress() {
  if (!window.ethereum) return;

  provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  try {
    const goal = await contract.goal();
    const raised = await contract.totalRaised();

    const goalEth = Number(ethers.formatEther(goal));
    const raisedEth = Number(ethers.formatEther(raised));

    updateProgress(raisedEth, goalEth);
  } catch (error) {
    console.error("Error al obtener progreso:", error);
  }
}

// Llamamos una vez al cargar la página
fetchAndUpdateProgress();

// Y opcionalmente cada cierto tiempo, por ejemplo cada 30s
setInterval(fetchAndUpdateProgress, 30000);

