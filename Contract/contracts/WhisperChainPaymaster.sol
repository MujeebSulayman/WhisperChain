// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

/**
 * Paymaster that sponsors gas for WhisperChain (and other) meta-txs.
 * Holds ETH; relayers submit signed ForwardRequests and get reimbursed from this contract.
 */
contract WhisperChainPaymaster is Ownable, ReentrancyGuard {
    MinimalForwarder public immutable forwarder;

    uint256 public maxReimbursementPerTx = 0.01 ether;
    uint256 public totalReimbursed;

    event Relayed(
        address indexed from,
        address indexed to,
        address indexed relayer,
        uint256 reimbursement
    );
    event MaxReimbursementUpdated(uint256 oldMax, uint256 newMax);
    event Deposited(address indexed from, uint256 amount);

    constructor(address _forwarder) {
        require(_forwarder != address(0), "Invalid forwarder");
        forwarder = MinimalForwarder(payable(_forwarder));
    }

    receive() external payable {
        emit Deposited(_msgSender(), msg.value);
    }

    function deposit() external payable {
        emit Deposited(_msgSender(), msg.value);
    }

    function relay(
        MinimalForwarder.ForwardRequest calldata req,
        bytes calldata signature,
        address relayer,
        uint256 reimbursement
    ) external payable nonReentrant {
        require(relayer != address(0), "Invalid relayer");
        require(
            reimbursement <= maxReimbursementPerTx,
            "Reimbursement exceeds max"
        );
        require(
            address(this).balance >= req.value + reimbursement,
            "Insufficient balance"
        );

        (bool success, ) = address(forwarder).call{value: req.value}(
            abi.encodeWithSelector(
                MinimalForwarder.execute.selector,
                req,
                signature
            )
        );
        require(success, "Forward failed");

        if (reimbursement > 0) {
            totalReimbursed += reimbursement;
            (bool sent, ) = relayer.call{value: reimbursement}("");
            require(sent, "Reimbursement failed");
        }

        emit Relayed(req.from, req.to, relayer, reimbursement);
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
