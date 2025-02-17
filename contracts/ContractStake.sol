// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract {
    IERC20 public immutable stakingToken;
    uint256 public constant REWARD_RATE = 100; // Reward rate per second per token
    uint256 public constant MIN_STAKE_PERIOD = 7 days;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);

    error ZeroStakeAmount();
    error NoStakedAmount();
    error MinimumStakePeriodNotMet();

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 _amount) external {
        if (_amount == 0) revert ZeroStakeAmount();
        StakeInfo storage userStake = stakes[msg.sender];

        updateRewards(msg.sender);

        stakingToken.transferFrom(msg.sender, address(this), _amount);
        userStake.amount += _amount;
        userStake.startTime = block.timestamp;
        
        emit Staked(msg.sender, _amount);
    }

    function withdraw() external {
        StakeInfo storage userStake = stakes[msg.sender];
        if (userStake.amount == 0) revert NoStakedAmount();
        if (block.timestamp < userStake.startTime + MIN_STAKE_PERIOD) revert MinimumStakePeriodNotMet();
        
        updateRewards(msg.sender);
        uint256 reward = userStake.rewardDebt;
        uint256 amount = userStake.amount;

        userStake.amount = 0;
        userStake.rewardDebt = 0;

        stakingToken.transfer(msg.sender, amount + reward);
        emit Withdrawn(msg.sender, amount, reward);
    }

    function updateRewards(address _user) internal {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount > 0) {
            uint256 stakingDuration = block.timestamp - userStake.startTime;
            userStake.rewardDebt += (userStake.amount * stakingDuration * REWARD_RATE) / 1e18;
        }
    }

    function getReward(address _user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        uint256 stakingDuration = block.timestamp - userStake.startTime;
        return (userStake.amount * stakingDuration * REWARD_RATE) / 1e18 + userStake.rewardDebt;
    }
}
