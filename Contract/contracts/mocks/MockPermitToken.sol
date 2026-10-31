// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @dev Test-only token with EIP-2612 permit, standing in for USDC.
contract MockPermitToken is ERC20Permit {
    constructor() ERC20("Mock USDC", "mUSDC") ERC20Permit("Mock USDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
