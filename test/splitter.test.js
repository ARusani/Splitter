/* eslint-disable new-cap */
/* eslint-disable max-len */
/* eslint-disable one-var */
'use strict';

web3.eth.getTransactionReceiptMined = require('../gistLepretre/getTransactionReceiptMined.js');
web3.eth.expectedExceptionPromise = require('../gistLepretre/expected_exception_testRPC_and_geth.js');

const {BN, toWei, sha3} = web3.utils;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai')
    .use(require('chai-as-promised'))
    .use(require('bn-chai')(BN))
    .should();

const Splitter = artifacts.require('Splitter.sol');

contract('Splitter', function(accounts) {
  const MAX_GAS = '4700000';

  let coinbase, alice, bob, carol;
  before('checking accounts', async () => {
    assert.isAtLeast(accounts.length, 5, 'not enough accounts');

    coinbase = await web3.eth.getCoinbase();

    const coinbaseIndex = await accounts.indexOf(coinbase);
    // Remove the coinbase account
    if (coinbaseIndex > -1) {
      accounts.splice(coinbaseIndex, 1);
    }
    [alice, bob, carol] = accounts;
  });

  describe('#Splitter()', () => {
    describe('costructor', () => {
      it('should emit EventSplitterCreated', async () => {
        const splitterInstance = await Splitter.new(
            {from: alice}).should.be.fulfilled;
        const receipt = await web3.eth.getTransactionReceiptMined(splitterInstance.transactionHash);
        // verifies event :
        // 1) OwnershipTransferred from Owner
        // 2) EventSplitterCreated from Splitter

        receipt.logs.length.should.be.equal(2);
        const logEventSplitterCreted = receipt.logs[1];
        logEventSplitterCreted.topics[0].should.be.equal(sha3('EventSplitterCreated(address)'));

        // Oops it looks like this functionality has been removed!
        /* const formattedEvent = splitterInstance.EventSplitterCreated().formatter(logEventSplitterCreted); */
      });
    });

    describe('Test Splitter Instance methods:', () => {
      let splitterInstance, splitterInstanceOne;

      const amounts = [
        {amount: toWei('0.0001', 'ether'), half: toWei('0.00005', 'ether'), rem: '0'},
        {amount: toWei('100', 'szabo'), half: toWei('50', 'szabo'), rem: '0'},
        {amount: toWei('1', 'finney'), half: toWei('0.5', 'finney'), rem: '0'},
        {amount: toWei('0.000000009', 'gwei'), half: toWei('0.000000004', 'gwei'), rem: toWei('0.000000001', 'gwei')},
      ];

      before('should deploy Splitter instance', async () => {
        splitterInstanceOne = await Splitter.new(
            {from: alice}).should.be.fulfilled;
      });

      beforeEach('should deploy Splitter instance', async () => {
        splitterInstance = await Splitter.new(
            {from: alice}).should.be.fulfilled;
      });

      describe('#splitEthers()', () => {
        describe('allowed', () => {
          amounts.forEach(function(value) {
            it('split amounts to beneficiary1 and beneficiary2, remainder to the owner', async () => {
              const result = await splitterInstance.splitEthers( bob, carol,
                  {from: alice, value: value.amount, gas: MAX_GAS});

              result.logs.length.should.be.equal(1);
              result.logs[0].event.should.be.equal('EventEtherSplitted');
              result.logs[0].args.caller.should.be.equal(alice);
              result.logs[0].args.beneficiary1.should.be.equal(bob);
              result.logs[0].args.beneficiary2.should.be.equal(carol);
              result.logs[0].args.splittedValue.should.be.eq.BN(value.half);
              result.logs[0].args.remainder.should.be.eq.BN(value.rem);

              const balanceBob = await splitterInstance.credit(bob);
              const balanceCarol = await splitterInstance.credit(carol);

              balanceBob.should.be.eq.BN(value.half);
              balanceCarol.should.be.eq.BN(value.half);
            });
          });

          const values = [
            {'beneficiary1': accounts[0], 'beneficiary2': accounts[1], 'amount': amounts[1].amount, 'sender': accounts[2]},
            {'beneficiary1': accounts[1], 'beneficiary2': accounts[2], 'amount': amounts[2].amount, 'sender': accounts[0]},
            {'beneficiary1': accounts[1], 'beneficiary2': accounts[2], 'amount': amounts[2].amount, 'sender': accounts[1]},
          ];

          values.forEach(function(value) {
            it('split amounts correctly', async () => {
              const balanceBeforeB1 = await splitterInstanceOne.credit(value.beneficiary1);
              const balanceBeforeB2 = await splitterInstanceOne.credit(value.beneficiary2);

              await splitterInstanceOne.splitEthers( value.beneficiary1, value.beneficiary2,
                  {from: value.sender, value: value.amount, gas: MAX_GAS})
                  .should.be.fulfilled;

              const valueBN = new BN(value.amount);

              // check for value 1
              const creditExpected = valueBN.div(new BN('2'));

              const balanceB1 = await splitterInstanceOne.credit(value.beneficiary1);
              const balanceB2 = await splitterInstanceOne.credit(value.beneficiary2);

              balanceB1.should.be.eq.BN(balanceBeforeB1.add(creditExpected));
              balanceB2.should.be.eq.BN(balanceBeforeB2.add(creditExpected));
            });
          });
        });

        describe('fails', () => {
          it('if called in Stopped state ', async () => {
            await splitterInstance.stop({from: alice});

            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( alice, carol,
                  {from: alice, value: amounts[0].amount, gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if first beneficiary is address(0)', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( ZERO_ADDRESS, carol,
                  {from: alice, value: amounts[0].amount, gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if second beneficiary is address(0)', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( bob, ZERO_ADDRESS,
                  {from: alice, value: amounts[0].amount, gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if amount send is zero', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( bob, carol,
                  {from: alice, value: 0, gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if address of first beneficiary is equal to second', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( bob, bob,
                  {from: alice, value: amounts[0].amount, gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if amount send is not divisible by 2', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( bob, carol,
                  {from: alice, value: toWei('0.000000001', 'gwei'), gas: MAX_GAS});
            }, MAX_GAS);
          });

        });
      });

      describe('#withdraw()', () => {
        const value = amounts[2].amount;
        const halfExpected = new BN(amounts[2].half);

        beforeEach('Split some amount', async () => {
          await splitterInstance.splitEthers( bob, carol,
              {from: alice, value: value, gas: MAX_GAS})
              .should.be.fulfilled;
        });

        it('should allow withdraw and emit EventWithdraw', async () => {
          const preBobBalance = new BN(await web3.eth.getBalance(bob));

          const result = await splitterInstance.withdraw({from: bob, gas: MAX_GAS});
          result.logs.length.should.be.equal(1);
          result.logs[0].event.should.be.equal('EventWithdraw');
          result.logs[0].args.caller.should.be.equal(bob);
          result.logs[0].args.balance.should.be.eq.BN(halfExpected);

          const gasUsedWithdrawFunds = new BN(result.receipt.gasUsed);
          const txObj = await web3.eth.getTransaction(result.tx);
          const gasPriceWithdrawFunds = new BN(txObj.gasPrice);
          const totalGas = gasPriceWithdrawFunds.mul(gasUsedWithdrawFunds);

          const postBobBalance = new BN(await web3.eth.getBalance(bob));
          postBobBalance.should.be.eq.BN(preBobBalance.add(halfExpected).sub(totalGas));

          const bobCreditLeft = await splitterInstance.credit(bob);
          bobCreditLeft.should.be.eq.BN(0);
        });

        it('should fail if caller balance is zero', async () => {
          await web3.eth.expectedExceptionPromise(() => {
            return splitterInstance.withdraw({from: alice, gas: MAX_GAS});
          }, MAX_GAS);
        });

        it('should fail withdraws two times', async () => {
          await splitterInstance.withdraw({from: bob, gas: MAX_GAS})
              .should.be.fulfilled;

          await web3.eth.expectedExceptionPromise(() => {
            return splitterInstance.withdraw({from: bob, gas: MAX_GAS});
          }, MAX_GAS);
        });
      });

      describe('#()', () => {
        accounts.forEach(function(address) {
          it(`should revert called from  (${address}) address`, async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.sendTransaction(
                  {from: address, value: amounts[0].amount, gas: MAX_GAS});
            }, MAX_GAS);
          });
        });
      });
    });
  });
});
