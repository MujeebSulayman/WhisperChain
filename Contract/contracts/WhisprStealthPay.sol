// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Private payments for Whispr using stealth addresses (ERC-5564, scheme 1: secp256k1).
/// Each payment goes to a fresh one-time address that only the recipient can derive and spend
/// from, so the chain doesn't show who was paid. Calls come through the trusted Forwarder, so
/// a paymaster can cover the gas: senders and claimers never need ETH for token payments.
contract WhisprStealthPay is ERC2771Context, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice ERC-5564 scheme id for secp256k1 stealth addresses with view tags.
    uint256 public constant SCHEME_ID = 1;
    /// @notice A stealth meta-address is a compressed spending key then a compressed viewing key.
    uint256 public constant META_ADDRESS_LENGTH = 66;

    mapping(address => bytes) public stealthMetaAddressOf;

    event StealthMetaAddressSet(address indexed registrant, bytes stealthMetaAddress);
    /// @dev Same shape as the ERC-5564 Announcer's event, so standard scanners can read it.
    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );
    event Claimed(address indexed stealthAddress, address indexed token, address indexed to, uint256 amount);

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    /// @notice Publish the keys others derive your stealth addresses from.
    function registerKeys(bytes calldata stealthMetaAddress) external {
        require(stealthMetaAddress.length == META_ADDRESS_LENGTH, "Invalid meta-address");
        stealthMetaAddressOf[_msgSender()] = stealthMetaAddress;
        emit StealthMetaAddressSet(_msgSender(), stealthMetaAddress);
    }

    /// @notice Pay ETH to a stealth address. Sent from the payer's own wallet (ETH can't be relayed).
    function sendEth(
        address payable stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external payable nonReentrant {
        require(msg.value > 0, "Nothing to send");
        require(stealthAddress != address(0), "Invalid stealth address");
        (bool sent, ) = stealthAddress.call{value: msg.value}("");
        require(sent, "ETH transfer failed");
        emit Announcement(SCHEME_ID, stealthAddress, _msgSender(), ephemeralPubKey, metadata);
    }

    /// @notice Pay a token to a stealth address. Pass a permit signature (deadline > 0) to skip a
    /// separate approval; with deadline 0 the existing allowance is used.
    function sendToken(
        address token,
        address stealthAddress,
        uint256 amount,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        require(amount > 0, "Nothing to send");
        require(stealthAddress != address(0), "Invalid stealth address");
        address payer = _msgSender();
        _tryPermit(token, payer, amount, deadline, v, r, s);
        IERC20(token).safeTransferFrom(payer, stealthAddress, amount);
        emit Announcement(SCHEME_ID, stealthAddress, payer, ephemeralPubKey, metadata);
    }

    /// @notice Move tokens out of a stealth address. The request is signed with the stealth key,
    /// so the stealth address is the sender and the destination can't be swapped by anyone else.
    function claimToken(
        address token,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        require(to != address(0), "Invalid destination");
        address stealthAddress = _msgSender();
        _tryPermit(token, stealthAddress, amount, deadline, v, r, s);
        IERC20(token).safeTransferFrom(stealthAddress, to, amount);
        emit Claimed(stealthAddress, token, to, amount);
    }

    /// @dev A permit seen in the mempool can be submitted by someone else first; that still sets
    /// the allowance, so a failed permit here is ignored and the transfer decides.
    function _tryPermit(
        address token,
        address owner,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private {
        if (deadline == 0) return;
        try IERC20Permit(token).permit(owner, address(this), amount, deadline, v, r, s) {} catch {}
    }
}
