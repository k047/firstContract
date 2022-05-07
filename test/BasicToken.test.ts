import {expect, use} from 'chai';
import {Contract} from 'ethers';
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import BasicToken from '../build/BasicToken.json';

use(solidity);

describe('BasicToken', () => {
  const [wallet, walletTo] = new MockProvider().getWallets();
  let token: Contract;

  beforeEach(async () => {
    token = await deployContract(wallet, BasicToken, [1000]);
  });

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(1000);
  });

  it('Transfer adds amount to destination account', async () => {
    await token.transfer(walletTo.address, 7);
    expect(await token.balanceOf(walletTo.address)).to.equal(7);
  });

  it('Transfer emits event', async () => {
    await expect(token.transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7);
  });
/*
  it('Can not transfer above the amount', async () => {
    await expect(token.transfer(walletTo.address, 1007))
    .to.be.revertedWith(
      'Insufficient funds');
  });
*/
  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo);
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
      .to.be.reverted;
  });

  it('Calls totalSupply on BasicToken contract', async () => {
    await token.totalSupply();
    expect('totalSupply').to.be.calledOnContract(token);
  });

  it('Calls balanceOf with sender address on BasicToken contract', async () => {
    await token.balanceOf(wallet.address);
    expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
  });

  //-----------------------------------------------------------------------------------

  it("Send transation changes receiver balance", async () => {
    await expect(() => wallet.sendTransaction(
      {to: walletTo.address, gasPrice: 0, value: 200}
    ))
    .to.changeEtherBalance(walletTo, 200)
  });

  it("Send transation changes sender and receiver balances", async () => {
    await expect(() => wallet.sendTransaction(
      {to: walletTo.address, gasPrice: 0, value: 200}
    ))
    .to.changeEtherBalances([wallet, walletTo], [-200, 200])
  });

});