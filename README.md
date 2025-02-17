# StakingContract

## Overview
The `StakingContract` allows users to stake ERC-20 tokens and earn rewards over time. Users must stake tokens for a minimum period to be eligible for withdrawal along with accrued rewards.

## Features
- **Token Staking**: Users can stake a specified amount of ERC-20 tokens.
- **Rewards Accumulation**: Rewards are calculated based on the staked amount and duration.
- **Minimum Lock Period**: Users must stake for at least 7 days before withdrawal.
- **Secure Withdrawals**: Users can withdraw their staked tokens and rewards after meeting the minimum stake period.

## Contract Details
- **Solidity Version**: `0.8.20`
- **License**: `UNLICENSED`
- **Dependencies**: OpenZeppelin's `IERC20` for ERC-20 token interactions.

## Deployment
Ensure you have Solidity 0.8.20 and deploy the contract using Remix, Hardhat, or any Ethereum development tool.

```solidity
constructor(address _stakingToken)
```
- `_stakingToken`: Address of the ERC-20 token used for staking.

## Constants
- `REWARD_RATE = 100`: Reward rate per second per token.
- `MIN_STAKE_PERIOD = 7 days`: Minimum time required before withdrawal.

## Functions

### 1. `stake(uint256 _amount)`
Allows users to stake tokens.
```solidity
function stake(uint256 _amount) external;
```
- **Requirements:**
  - `_amount` must be greater than zero.
  - The contract must have permission to transfer tokens from the user.

### 2. `withdraw()`
Allows users to withdraw staked tokens and earned rewards.
```solidity
function withdraw() external;
```
- **Requirements:**
  - User must have staked tokens.
  - The minimum staking period must be met.

### 3. `getReward(address _user)`
Returns the current reward balance for a user.
```solidity
function getReward(address _user) external view returns (uint256);
```

### 4. `updateRewards(address _user) [Internal]`
Calculates and updates the user's reward balance.

## Events
```solidity
event Staked(address indexed user, uint256 amount);
event Withdrawn(address indexed user, uint256 amount, uint256 reward);
```
- `Staked`: Emitted when a user stakes tokens.
- `Withdrawn`: Emitted when a user withdraws tokens and rewards.

## Errors
```solidity
error ZeroStakeAmount();
error NoStakedAmount();
error MinimumStakePeriodNotMet();
```
- `ZeroStakeAmount`: Staking amount cannot be zero.
- `NoStakedAmount`: User must have staked tokens before withdrawal.
- `MinimumStakePeriodNotMet`: Staking period must be completed before withdrawal.

## Security Considerations
- Ensure only approved tokens are staked.
- Prevent re-entrant attacks by properly handling state updates before transfers.
- Use a secure reward calculation method to prevent overflows.


