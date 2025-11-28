// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract WhisperChain is ReentrancyGuard, Ownable, Pausable {
    struct Message {
        address sender;
        address recipient;
        bytes32 messageHash;
        uint256 timestamp;
        bool delivered;
        bool read;
        uint256 paymentAmount;
        address paymentToken;
        string ipfsHash;
        MediaType mediaType;
        uint256 fileSize;
        string textContent;
    }

    enum MediaType {
        TEXT,
        IMAGE,
        VIDEO,
        AUDIO,
        DOCUMENT
    }

    struct UserProfile {
        bytes32 publicKey;
        bool isActive;
        uint256 lastSeen;
        string username;
    }

    struct Conversation {
        address[] participants;
        bytes32 conversationKey;
        uint256 createdAt;
        bool isActive;
        uint256 messageCount;
    }

    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => Message) public messages;
    mapping(bytes32 => Conversation) public conversations;
    mapping(address => bytes32[]) public userMessages;
    mapping(address => bytes32[]) public userConversations;

    mapping(bytes32 => bool) public paymentSettled;
    mapping(address => uint256) public userBalances;

    mapping(bytes32 => bool) public messageDeleted;
    mapping(address => uint256) public userMessageCount;
    uint256 public constant MAX_MESSAGES_PER_USER = 10000;

    mapping(string => bool) public usedIPFSHashes;
    mapping(address => uint256) public userStorageUsed;
    uint256 public constant MAX_STORAGE_PER_USER = 1000000000;
    uint256 public constant MAX_FILE_SIZE = 50000000;

    event MessageSent(
        bytes32 indexed messageId,
        address indexed sender,
        address indexed recipient,
        uint256 timestamp,
        uint256 paymentAmount
    );

    event MessageDelivered(bytes32 indexed messageId, uint256 timestamp);
    event MessageRead(bytes32 indexed messageId, uint256 timestamp);
    event MessageDeleted(bytes32 indexed messageId, address indexed deleter);
    event PaymentSettled(bytes32 indexed messageId, uint256 amount);
    event UserRegistered(address indexed user, bytes32 publicKey);
    event ConversationCreated(
        bytes32 indexed conversationId,
        address[] participants
    );
    event BatchMessageSent(bytes32[] messageIds, address indexed sender);
    event MediaUploaded(
        bytes32 indexed messageId,
        string ipfsHash,
        MediaType mediaType
    );
    event StorageLimitExceeded(
        address indexed user,
        uint256 used,
        uint256 limit
    );

    modifier onlyRegisteredUser() {
        require(userProfiles[msg.sender].isActive, "User not registered");
        _;
    }

    modifier messageExists(bytes32 messageId) {
        require(
            messages[messageId].sender != address(0),
            "Message does not exist"
        );
        _;
    }

    modifier notDeleted(bytes32 messageId) {
        require(!messageDeleted[messageId], "Message deleted");
        _;
    }

    modifier storageLimitCheck(uint256 fileSize) {
        require(
            userStorageUsed[msg.sender] + fileSize <= MAX_STORAGE_PER_USER,
            "Storage limit exceeded"
        );
        _;
    }

    modifier fileSizeCheck(uint256 fileSize) {
        require(fileSize <= MAX_FILE_SIZE, "File too large");
        _;
    }

    constructor() {
        _registerUser(bytes32(0), "");
    }

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

    function updatePublicKey(bytes32 newPublicKey) external onlyRegisteredUser {
        require(newPublicKey != bytes32(0), "Invalid public key");
        userProfiles[msg.sender].publicKey = newPublicKey;
        userProfiles[msg.sender].lastSeen = block.timestamp;
    }

    function updateLastSeen() external onlyRegisteredUser {
        userProfiles[msg.sender].lastSeen = block.timestamp;
    }

    function sendMessage(
        address recipient,
        bytes32 messageHash,
        address paymentToken,
        uint256 paymentAmount,
        string memory ipfsHash,
        MediaType mediaType,
        uint256 fileSize,
        string memory textContent
    ) external payable onlyRegisteredUser nonReentrant whenNotPaused {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot send to self");
        require(userProfiles[recipient].isActive, "Recipient not registered");
        require(messageHash != bytes32(0), "Invalid message hash");
        require(
            userMessageCount[msg.sender] < MAX_MESSAGES_PER_USER,
            "User message limit exceeded"
        );

        if (mediaType == MediaType.TEXT) {
            require(
                bytes(textContent).length > 0,
                "Text content required for TEXT messages"
            );
            if (bytes(ipfsHash).length > 0 && !usedIPFSHashes[ipfsHash]) {
                usedIPFSHashes[ipfsHash] = true;
            }
        } else {
            require(
                bytes(ipfsHash).length > 0,
                "IPFS hash required for media messages"
            );
            require(!usedIPFSHashes[ipfsHash], "IPFS hash already used");
            require(fileSize <= MAX_FILE_SIZE, "File too large");
            require(
                userStorageUsed[msg.sender] + fileSize <= MAX_STORAGE_PER_USER,
                "Storage limit exceeded"
            );
        }

        if (paymentAmount > 0) {
            if (paymentToken == address(0)) {
                require(msg.value >= paymentAmount, "Insufficient ETH payment");
            } else {
                IERC20 token = IERC20(paymentToken);
                require(
                    token.transferFrom(
                        msg.sender,
                        address(this),
                        paymentAmount
                    ),
                    "Token transfer failed"
                );
            }
        }

        bytes32 messageId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                messageHash,
                block.timestamp,
                block.number
            )
        );

        messages[messageId] = Message({
            sender: msg.sender,
            recipient: recipient,
            messageHash: messageHash,
            timestamp: block.timestamp,
            delivered: false,
            read: false,
            paymentAmount: paymentAmount,
            paymentToken: paymentToken,
            ipfsHash: ipfsHash,
            mediaType: mediaType,
            fileSize: fileSize,
            textContent: textContent
        });

        userMessages[msg.sender].push(messageId);
        userMessages[recipient].push(messageId);

        userMessageCount[msg.sender]++;

        if (bytes(ipfsHash).length > 0 && !usedIPFSHashes[ipfsHash]) {
            usedIPFSHashes[ipfsHash] = true;
        }

        if (mediaType != MediaType.TEXT) {
            userStorageUsed[msg.sender] += fileSize;
        }

        emit MessageSent(
            messageId,
            msg.sender,
            recipient,
            block.timestamp,
            paymentAmount
        );
        emit MediaUploaded(messageId, ipfsHash, mediaType);
    }

    function markAsDelivered(
        bytes32 messageId
    ) external messageExists(messageId) {
        Message storage message = messages[messageId];
        require(message.recipient == msg.sender, "Not the recipient");
        require(!message.delivered, "Already delivered");

        message.delivered = true;

        if (message.paymentAmount > 0) {
            _settlePayment(messageId);
        }

        emit MessageDelivered(messageId, block.timestamp);
    }

    function markAsRead(
        bytes32 messageId
    ) external messageExists(messageId) notDeleted(messageId) {
        Message storage message = messages[messageId];
        require(message.recipient == msg.sender, "Not the recipient");
        require(message.delivered, "Message not delivered");
        require(!message.read, "Already read");

        message.read = true;
        emit MessageRead(messageId, block.timestamp);
    }

    function deleteMessage(
        bytes32 messageId
    ) external messageExists(messageId) notDeleted(messageId) {
        Message storage message = messages[messageId];
        require(
            message.sender == msg.sender || message.recipient == msg.sender,
            "Not authorized to delete"
        );

        messageDeleted[messageId] = true;
        emit MessageDeleted(messageId, msg.sender);
    }

    function sendBatchMessages(
        address[] memory recipients,
        bytes32[] memory messageHashes,
        address[] memory paymentTokens,
        uint256[] memory paymentAmounts,
        string[] memory ipfsHashes,
        MediaType[] memory mediaTypes,
        uint256[] memory fileSizes,
        string[] memory textContents
    ) external payable onlyRegisteredUser nonReentrant whenNotPaused {
        require(
            recipients.length == messageHashes.length,
            "Array length mismatch"
        );
        require(
            recipients.length == paymentTokens.length,
            "Array length mismatch"
        );
        require(
            recipients.length == paymentAmounts.length,
            "Array length mismatch"
        );
        require(
            recipients.length == ipfsHashes.length,
            "Array length mismatch"
        );
        require(
            recipients.length == mediaTypes.length,
            "Array length mismatch"
        );
        require(recipients.length == fileSizes.length, "Array length mismatch");
        require(
            recipients.length == textContents.length,
            "Array length mismatch"
        );
        require(recipients.length <= 10, "Too many messages in batch");

        bytes32[] memory messageIds = new bytes32[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(recipients[i] != msg.sender, "Cannot send to self");
            require(
                userProfiles[recipients[i]].isActive,
                "Recipient not registered"
            );
            require(messageHashes[i] != bytes32(0), "Invalid message hash");

            if (mediaTypes[i] == MediaType.TEXT) {
                require(
                    bytes(textContents[i]).length > 0,
                    "Text content required for TEXT messages"
                );
                if (
                    bytes(ipfsHashes[i]).length > 0 &&
                    !usedIPFSHashes[ipfsHashes[i]]
                ) {
                    usedIPFSHashes[ipfsHashes[i]] = true;
                }
            } else {
                require(
                    bytes(ipfsHashes[i]).length > 0,
                    "IPFS hash required for media messages"
                );
                require(
                    !usedIPFSHashes[ipfsHashes[i]],
                    "IPFS hash already used"
                );
                require(fileSizes[i] <= MAX_FILE_SIZE, "File too large");
                require(
                    userStorageUsed[msg.sender] + fileSizes[i] <=
                        MAX_STORAGE_PER_USER,
                    "Storage limit exceeded"
                );
            }

            bytes32 messageId = keccak256(
                abi.encodePacked(
                    msg.sender,
                    recipients[i],
                    messageHashes[i],
                    block.timestamp,
                    block.number,
                    i
                )
            );

            messages[messageId] = Message({
                sender: msg.sender,
                recipient: recipients[i],
                messageHash: messageHashes[i],
                timestamp: block.timestamp,
                delivered: false,
                read: false,
                paymentAmount: paymentAmounts[i],
                paymentToken: paymentTokens[i],
                ipfsHash: ipfsHashes[i],
                mediaType: mediaTypes[i],
                fileSize: fileSizes[i],
                textContent: textContents[i]
            });

            userMessages[msg.sender].push(messageId);
            userMessages[recipients[i]].push(messageId);
            messageIds[i] = messageId;

            if (
                bytes(ipfsHashes[i]).length > 0 &&
                !usedIPFSHashes[ipfsHashes[i]]
            ) {
                usedIPFSHashes[ipfsHashes[i]] = true;
            }

            if (mediaTypes[i] != MediaType.TEXT) {
                userStorageUsed[msg.sender] += fileSizes[i];
            }
        }

        userMessageCount[msg.sender] += recipients.length;

        emit BatchMessageSent(messageIds, msg.sender);
    }

    function _settlePayment(bytes32 messageId) internal {
        Message storage message = messages[messageId];
        require(!paymentSettled[messageId], "Payment already settled");

        if (message.paymentAmount > 0) {
            if (message.paymentToken == address(0)) {
                (bool success, ) = message.recipient.call{
                    value: message.paymentAmount
                }("");
                require(success, "ETH transfer failed");
            } else {
                IERC20 token = IERC20(message.paymentToken);
                require(
                    token.transfer(message.recipient, message.paymentAmount),
                    "Token transfer failed"
                );
            }

            paymentSettled[messageId] = true;
            emit PaymentSettled(messageId, message.paymentAmount);
        }
    }

    function withdrawBalance() external onlyRegisteredUser nonReentrant {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        userBalances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function createConversation(
        address[] memory participants,
        bytes32 conversationKeyHash
    ) external onlyRegisteredUser {
        require(participants.length >= 2, "Need at least 2 participants");
        require(conversationKeyHash != bytes32(0), "Invalid conversation key");

        for (uint256 i = 0; i < participants.length; i++) {
            require(
                userProfiles[participants[i]].isActive,
                "Participant not registered"
            );
        }

        bytes32 conversationId = keccak256(
            abi.encodePacked(participants, conversationKeyHash, block.timestamp)
        );

        conversations[conversationId] = Conversation({
            participants: participants,
            conversationKey: conversationKeyHash,
            createdAt: block.timestamp,
            isActive: true,
            messageCount: 0
        });

        for (uint256 i = 0; i < participants.length; i++) {
            userConversations[participants[i]].push(conversationId);
        }

        emit ConversationCreated(conversationId, participants);
    }

    function getUserPublicKey(address user) external view returns (bytes32) {
        return userProfiles[user].publicKey;
    }

    function getMessage(
        bytes32 messageId
    ) external view returns (Message memory) {
        return messages[messageId];
    }

    function getUserMessages(
        address user
    ) external view returns (bytes32[] memory) {
        return userMessages[user];
    }

    function getConversation(
        bytes32 conversationId
    ) external view returns (Conversation memory) {
        return conversations[conversationId];
    }

    function isUserRegistered(address user) external view returns (bool) {
        return userProfiles[user].isActive;
    }

    function getUserMessageCount(address user) external view returns (uint256) {
        return userMessageCount[user];
    }

    function isMessageDeleted(bytes32 messageId) external view returns (bool) {
        return messageDeleted[messageId];
    }

    function getContractStats()
        external
        view
        returns (uint256, uint256, uint256)
    {
        return (0, 0, address(this).balance);
    }

    function getUserStorageUsed(address user) external view returns (uint256) {
        return userStorageUsed[user];
    }

    function getRemainingStorage(address user) external view returns (uint256) {
        return MAX_STORAGE_PER_USER - userStorageUsed[user];
    }

    function isIPFSHashUsed(
        string memory ipfsHash
    ) external view returns (bool) {
        return usedIPFSHashes[ipfsHash];
    }

    function getMediaType(bytes32 messageId) external view returns (MediaType) {
        return messages[messageId].mediaType;
    }

    function getIPFSHash(
        bytes32 messageId
    ) external view returns (string memory) {
        return messages[messageId].ipfsHash;
    }

    function getFileSize(bytes32 messageId) external view returns (uint256) {
        return messages[messageId].fileSize;
    }

    function getTextContent(
        bytes32 messageId
    ) external view returns (string memory) {
        return messages[messageId].textContent;
    }

    function clearStorage() external onlyRegisteredUser {
        userStorageUsed[msg.sender] = 0;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    receive() external payable {}
}
