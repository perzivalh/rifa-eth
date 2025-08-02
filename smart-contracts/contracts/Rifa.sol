// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityRaffle is Ownable {
    uint256 public constant TICKET_PRICE = 0.005 ether;
    uint256 public immutable goal;
    uint256 public immutable endTime;
    uint256 public totalRaised;
    uint256 public totalTicketsSold;

    mapping(address => uint256) public ticketsPerAddress;
    mapping(address => string) public usernameOf;
    address[] public participants;

    event TicketPurchased(address indexed buyer, uint256 quantity, string username);
    event RaffleEnded(address indexed winner, uint256 amountRaised);
    event FundsWithdrawn(uint256 amount);

    constructor(uint256 _goal, uint256 _durationInHours) Ownable(msg.sender) {
        goal = _goal;
        endTime = block.timestamp + (_durationInHours * 1 hours);
    }

    function buyTickets(uint256 _quantity, string memory _username) external payable {
        require(block.timestamp < endTime, "La rifa ha terminado");
        require(msg.value == _quantity * TICKET_PRICE, "Cantidad de ETH incorrecta");
        require(_quantity > 0, "Debes comprar al menos 1 boleto");

        if (bytes(usernameOf[msg.sender]).length == 0) {
            usernameOf[msg.sender] = _username;
            participants.push(msg.sender);
        }

        ticketsPerAddress[msg.sender] += _quantity;
        totalRaised += msg.value;
        totalTicketsSold += _quantity;

        emit TicketPurchased(msg.sender, _quantity, _username);
    }

    function timeLeft() external view returns (uint256) {
        return endTime > block.timestamp ? endTime - block.timestamp : 0;
    }

    function getTopDonors(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        uint256 limit = _limit > participants.length ? participants.length : _limit;
        address[] memory topDonors = new address[](limit);
        uint256[] memory tickets = new uint256[](limit);

        for (uint256 i = 0; i < limit; i++) {
            topDonors[i] = participants[i];
            tickets[i] = ticketsPerAddress[participants[i]];
        }

        return (topDonors, tickets);
    }

    function endRaffle() external onlyOwner {
        require(block.timestamp >= endTime, "La rifa aun no termina");
        require(participants.length > 0, "No hay participantes");

        bytes32 rand = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, participants.length));
        uint256 winnerIndex = uint256(rand) % participants.length;
        address winner = participants[winnerIndex];

        emit RaffleEnded(winner, totalRaised);
    }

    function withdrawFunds() external onlyOwner {
        require(block.timestamp >= endTime, "No puedes retirar fondos antes del cierre");
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay fondos para retirar");

        payable(owner()).transfer(balance);
        emit FundsWithdrawn(balance);
    }

    function progress() external view returns (uint256) {
        return (totalRaised * 100) / goal;
    }
}
