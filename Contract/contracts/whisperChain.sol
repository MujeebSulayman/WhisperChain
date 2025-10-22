// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title WhisperChain
 * @dev Decentralized privacy-first messaging and payment system
 * Features: End-to-end encryption, on-chain payments, delivery receipts
 */
contract WhisperChain is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STRUCTS ============
    
    struct Message {
        address sender;
        address recipient;
        bytes32 messageHash; // Hash of encrypted message
        uint256 timestamp;
        bool delivered;
        bool read;
        uint256 paymentAmount;
        address paymentToken; // address(0) for ETH
    }
    
    struct UserProfile {
        bytes32 publicKey; // X25519 public key
        bool isActive;
        uint256 lastSeen;
        string username; // Optional username
    }
    
    struct Conversation {
        address[] participants;
        bytes32 conversationKey; // Shared encryption key hash
        uint256 createdAt;
        bool isActive;
        uint256 messageCount;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => Message) public messages;
    mapping(bytes32 => Conversation) public conversations;
    mapping(address => bytes32[]) public userMessages;
    mapping(address => bytes32[]) public userConversations;
    
    // Payment tracking
    mapping(bytes32 => bool) public paymentSettled;
    mapping(address => uint256) public userBalances;
    
    // Events
    event MessageSent(
        bytes32 indexed messageId,
        address indexed sender,
        address indexed recipient,
        uint256 timestamp,
        uint256 paymentAmount
    );
    
    event MessageDelivered(bytes32 indexed messageId, uint256 timestamp);
    event MessageRead(bytes32 indexed messageId, uint256 timestamp);
    event PaymentSettled(bytes32 indexed messageId, uint256 amount);
    event UserRegistered(address indexed user, bytes32 publicKey);
    event ConversationCreated(bytes32 indexed conversationId, address[] participants);
    
    // ============ MODIFIERS ============
    
    modifier onlyRegisteredUser() {
        require(userProfiles[msg.sender].isActive, "User not registered");
        _;
    }
    
    modifier messageExists(bytes32 messageId) {
        require(messages[messageId].sender != address(0), "Message does not exist");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Initialize with owner as first registered user
        _registerUser(bytes32(0), "");
    }
    
    // ============ USER MANAGEMENT ============
    
    /**
     * @dev Register a new user with their public key
     * @param publicKey X25519 public key for encryption
     * @param username Optional username
     */
    function registerUser(bytes32 publicKey, string memory username) external {
        require(!userProfiles[msg.sender].isActive, "User already registered");
        require(publicKey != bytes32(0), "Invalid public key");
        
        _registerUser(publicKey, username);
    }
    
    function _registerUser(bytes32 publicKey, string memory username) internal {
        userProfiles[msg.sender] = UserProfile({
            publicKey: publicKey,
            isActive: true,
            lastSeen: block.timestamp,
            username: username
        });
        
        emit UserRegistered(msg.sender, publicKey);
    }
    
    /**
     * @dev Update user's public key
     * @param newPublicKey New X25519 public key
     */
    function updatePublicKey(bytes32 newPublicKey) external onlyRegisteredUser {
        require(newPublicKey != bytes32(0), "Invalid public key");
        userProfiles[msg.sender].publicKey = newPublicKey;
        userProfiles[msg.sender].lastSeen = block.timestamp;
    }
    
    /**
     * @dev Update user's last seen timestamp
     */
    function updateLastSeen() external onlyRegisteredUser {
        userProfiles[msg.sender].lastSeen = block.timestamp;
    }
    
    // ============ MESSAGING ============
    
    /**
     * @dev Send an encrypted message with optional payment
     * @param recipient Message recipient
     * @param messageHash Hash of encrypted message
     * @param paymentToken Token address for payment (address(0) for ETH)
     * @param paymentAmount Payment amount in wei
     */
    function sendMessage(
        address recipient,
        bytes32 messageHash,
        address paymentToken,
        uint256 paymentAmount
    ) external payable onlyRegisteredUser nonReentrant whenNotPaused {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot send to self");
        require(userProfiles[recipient].isActive, "Recipient not registered");
        require(messageHash != bytes32(0), "Invalid message hash");
        
        // Handle payment if specified
        if (paymentAmount > 0) {
            if (paymentToken == address(0)) {
                require(msg.value >= paymentAmount, "Insufficient ETH payment");
            } else {
                IERC20 token = IERC20(paymentToken);
                require(token.transferFrom(msg.sender, address(this), paymentAmount), "Token transfer failed");
            }
        }
        
        bytes32 messageId = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            messageHash,
            block.timestamp,
            block.number
        ));
        
        messages[messageId] = Message({
            sender: msg.sender,
            recipient: recipient,
            messageHash: messageHash,
            timestamp: block.timestamp,
            delivered: false,
            read: false,
            paymentAmount: paymentAmount,
            paymentToken: paymentToken
        });
        
        userMessages[msg.sender].push(messageId);
        userMessages[recipient].push(messageId);
        
        emit MessageSent(messageId, msg.sender, recipient, block.timestamp, paymentAmount);
    }
    
    /**
     * @dev Mark message as delivered
     * @param messageId Message identifier
     */
    function markAsDelivered(bytes32 messageId) external messageExists(messageId) {
        Message storage message = messages[messageId];
        require(message.recipient == msg.sender, "Not the recipient");
        require(!message.delivered, "Already delivered");
        
        message.delivered = true;
        
        // Release payment to recipient if any
        if (message.paymentAmount > 0) {
            _settlePayment(messageId);
        }
        
        emit MessageDelivered(messageId, block.timestamp);
    }
    
    /**
     * @dev Mark message as read
     * @param messageId Message identifier
     */
    function markAsRead(bytes32 messageId) external messageExists(messageId) {
        Message storage message = messages[messageId];
        require(message.recipient == msg.sender, "Not the recipient");
        require(message.delivered, "Message not delivered");
        require(!message.read, "Already read");
        
        message.read = true;
        emit MessageRead(messageId, block.timestamp);
    }
    
    // ============ PAYMENT SYSTEM ============
    
    /**
     * @dev Settle payment for a message
     * @param messageId Message identifier
     */
    function _settlePayment(bytes32 messageId) internal {
        Message storage message = messages[messageId];
        require(!paymentSettled[messageId], "Payment already settled");
        
        if (message.paymentAmount > 0) {
            if (message.paymentToken == address(0)) {
                // ETH payment
                (bool success, ) = message.recipient.call{value: message.paymentAmount}("");
                require(success, "ETH transfer failed");
            } else {
                // ERC-20 payment
                IERC20 token = IERC20(message.paymentToken);
                require(token.transfer(message.recipient, message.paymentAmount), "Token transfer failed");
            }
            
            paymentSettled[messageId] = true;
            emit PaymentSettled(messageId, message.paymentAmount);
        }
    }
    
    /**
     * @dev Withdraw accumulated balance
     */
    function withdrawBalance() external onlyRegisteredUser nonReentrant {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        userBalances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // ============ CONVERSATION MANAGEMENT ============
    
    /**
     * @dev Create a new conversation
     * @param participants Array of participant addresses
     * @param conversationKeyHash Hash of shared encryption key
     */
    function createConversation(
        address[] memory participants,
        bytes32 conversationKeyHash
    ) external onlyRegisteredUser {
        require(participants.length >= 2, "Need at least 2 participants");
        require(conversationKeyHash != bytes32(0), "Invalid conversation key");
        
        // Verify all participants are registered
        for (uint256 i = 0; i < participants.length; i++) {
            require(userProfiles[participants[i]].isActive, "Participant not registered");
        }
        
        bytes32 conversationId = keccak256(abi.encodePacked(
            participants,
            conversationKeyHash,
            block.timestamp
        ));
        
        conversations[conversationId] = Conversation({
            participants: participants,
            conversationKey: conversationKeyHash,
            createdAt: block.timestamp,
            isActive: true,
            messageCount: 0
        });
        
        // Add to user's conversation list
        for (uint256 i = 0; i < participants.length; i++) {
            userConversations[participants[i]].push(conversationId);
        }
        
        emit ConversationCreated(conversationId, participants);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's public key
     * @param user User address
     * @return Public key
     */
    function getUserPublicKey(address user) external view returns (bytes32) {
        return userProfiles[user].publicKey;
    }
    
    /**
     * @dev Get message details
     * @param messageId Message identifier
     * @return Message struct
     */
    function getMessage(bytes32 messageId) external view returns (Message memory) {
        return messages[messageId];
    }
    
    /**
     * @dev Get user's messages
     * @param user User address
     * @return Array of message IDs
     */
    function getUserMessages(address user) external view returns (bytes32[] memory) {
        return userMessages[user];
    }
    
    /**
     * @dev Get conversation details
     * @param conversationId Conversation identifier
     * @return Conversation struct
     */
    function getConversation(bytes32 conversationId) external view returns (Conversation memory) {
        return conversations[conversationId];
    }
    
    /**
     * @dev Check if user is registered
     * @param user User address
     * @return True if registered
     */
    function isUserRegistered(address user) external view returns (bool) {
        return userProfiles[user].isActive;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {
        // Allow contract to receive ETH
    }
}
