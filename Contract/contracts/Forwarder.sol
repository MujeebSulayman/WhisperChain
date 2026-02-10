// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

/// Deployable forwarder for gasless meta-txs (same as OZ MinimalForwarder).
contract Forwarder is MinimalForwarder {}
