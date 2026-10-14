// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

/// @notice Pays for gasless WhisperChain messages. Approved relayers submit users' signed
/// requests through the Forwarder and are refunded a capped amount per request.
contract WhisperChainPaymaster is Ownable, ReentrancyGuard {
    MinimalForwarder public immutable forwarder;
    /// @notice The only contract this paymaster will pay to call (WhisperChain).
    address public immutable target;

    uint256 public maxReimbursementPerTx = 0.01 ether;
    uint256 public totalReimbursed;
    mapping(address => bool) public isRelayer;

    event Relayed(
        address indexed from,
        address indexed to,
        address indexed relayer,
        uint256 reimbursement
    );
    event MaxReimbursementUpdated(uint256 oldMax, uint256 newMax);
    event RelayerUpdated(address indexed relayer, bool allowed);
    event Deposited(address indexed from, uint256 amount);

    constructor(address _forwarder, address _target) {
        require(_forwarder != address(0), "Invalid forwarder");
        require(_target != address(0), "Invalid target");
        forwarder = MinimalForwarder(payable(_forwarder));
        target = _target;
    }

    receive() external payable {
        emit Deposited(_msgSender(), msg.value);
    }

    function deposit() external payable {
        emit Deposited(_msgSender(), msg.value);
    }

    /// @notice Run a signed request and refund the caller. Only approved relayers may call this,
    /// the refund always goes to the caller, and requests can't carry ETH or call anything but `target`.
    /// @dev `relayer` is kept for ABI compatibility and must equal msg.sender.
    function relay(
        MinimalForwarder.ForwardRequest calldata req,
        bytes calldata signature,
        address relayer,
        uint256 reimbursement
    ) external nonReentrant {
        require(isRelayer[msg.sender], "Not an approved relayer");
        require(relayer == msg.sender, "Relayer must be caller");
        require(req.to == target, "Unsupported target");
        require(req.value == 0, "ETH value not relayed");
        require(
            reimbursement <= maxReimbursementPerTx,
            "Reimbursement exceeds max"
        );
        require(
            address(this).balance >= reimbursement,
            "Insufficient balance"
        );

        // The forwarder returns (success, returndata) instead of reverting when the call fails,
        // so check the inner result: never pay for a message that didn't land.
        (bool ok, bytes memory returndata) = forwarder.execute(req, signature);
        if (!ok) {
            assembly {
                revert(add(returndata, 32), mload(returndata))
            }
        }

        if (reimbursement > 0) {
            totalReimbursed += reimbursement;
            (bool sent, ) = msg.sender.call{value: reimbursement}("");
            require(sent, "Reimbursement failed");
        }

        emit Relayed(req.from, req.to, msg.sender, reimbursement);
    }

    function setRelayer(address relayer, bool allowed) external onlyOwner {
        require(relayer != address(0), "Invalid relayer");
        isRelayer[relayer] = allowed;
        emit RelayerUpdated(relayer, allowed);
    }

    function setMaxReimbursementPerTx(uint256 _max) external onlyOwner {
        uint256 old = maxReimbursementPerTx;
        maxReimbursementPerTx = _max;
        emit MaxReimbursementUpdated(old, _max);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdraw failed");
    }
}
