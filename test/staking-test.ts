const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingContract", function () {
    let StakingContract, stakingContract, Token, token, owner, addr1, addr2;
    const initialSupply = ethers.parseEther("10000");
    const stakeAmount = ethers.parseEther("100");
    const rewardRate = 100;
    const minStakePeriod = 7 * 24 * 60 * 60;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        Token = await ethers.getContractFactory("ERC20Mock");
        token = await Token.deploy("TestToken", "TTK", initialSupply);
        await token.waitForDeployment();

        StakingContract = await ethers.getContractFactory("StakingContractNoReentrancy");
        stakingContract = await StakingContract.deploy(await token.getAddress());
        await stakingContract.waitForDeployment();

        // Transfer tokens to users
        await token.transfer(addr1.address, stakeAmount);
        await token.transfer(addr2.address, stakeAmount);
    });

    it("Should allow users to stake tokens", async function () {
        await token.connect(addr1).approve(await stakingContract.getAddress(), stakeAmount);
        await expect(stakingContract.connect(addr1).stake(stakeAmount))
            .to.emit(stakingContract, "Staked")
            .withArgs(addr1.address, stakeAmount);
    });

    it("Should not allow staking zero tokens", async function () {
        await expect(stakingContract.connect(addr1).stake(0)).to.be.revertedWithCustomError(
            stakingContract,
            "ZeroStakeAmount"
        );
    });

    it("Should not allow withdrawal before minimum stake period", async function () {
        await token.connect(addr1).approve(await stakingContract.getAddress(), stakeAmount);
        await stakingContract.connect(addr1).stake(stakeAmount);
        await expect(stakingContract.connect(addr1).withdraw()).to.be.revertedWithCustomError(
            stakingContract,
            "MinimumStakePeriodNotMet"
        );
    });

    it("Should allow withdrawal after minimum stake period with rewards", async function () {
        await token.connect(addr1).approve(await stakingContract.getAddress(), stakeAmount);
        await stakingContract.connect(addr1).stake(stakeAmount);
        
        await ethers.provider.send("evm_increaseTime", [minStakePeriod]);
        await ethers.provider.send("evm_mine");
        
        const initialBalance = await token.balanceOf(addr1.address);
        await expect(stakingContract.connect(addr1).withdraw())
            .to.emit(stakingContract, "Withdrawn");
        const finalBalance = await token.balanceOf(addr1.address);
        
        expect(finalBalance).to.be.above(initialBalance);
    });

    it("Should correctly calculate rewards", async function () {
        await token.connect(addr1).approve(await stakingContract.getAddress(), stakeAmount);
        await stakingContract.connect(addr1).stake(stakeAmount);
        
        await ethers.provider.send("evm_increaseTime", [minStakePeriod]);
        await ethers.provider.send("evm_mine");
        
        const expectedRewards = stakeAmount * BigInt(minStakePeriod) * BigInt(rewardRate) / BigInt(1e18);
        const rewards = await stakingContract.getReward(addr1.address);
        expect(rewards).to.be.closeTo(expectedRewards, 100);
    });
});
