'use strict';

web3.eth.getTransactionReceiptMined = require('../gistLepretre/getTransactionReceiptMined.js');
web3.eth.expectedExceptionPromise = require('../gistLepretre/expected_exception_testRPC_and_geth.js');

const BN = web3.utils.BN;
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
        logEventSplitterCreted.topics[0].should.be.equal(web3.utils.sha3('EventSplitterCreated(address)'));

        // Oops it looks like this functionality has been removed!
        /* const formattedEvent = splitterInstance.EventSplitterCreated().formatter(logEventSplitterCreted); */
      });
    });

    describe('Test Splitter Instance methods:', () => {
      let splitterInstance;

      const amounts = [web3.utils.toWei('0.0001', 'ether'),
        web3.utils.toWei('100', 'szabo'),
        web3.utils.toWei('1', 'finney'),
        web3.utils.toWei('0.000000009', 'gwei'),
      ];

      beforeEach('should deploy Splitter instance', async () => {
        splitterInstance = await Splitter.new(
            {from: alice}).should.be.fulfilled;
      });

      describe('#splitEthers()', () => {
        describe('allowed', () => {
          amounts.forEach(function(value) {
            it('split amounts to beneficiary1 and beneficiary2, remainder to the owner', async () => {
              const result = await splitterInstance.splitEthers( bob, carol,
                  {from: alice, value: value, gas: MAX_GAS});

              const valueBN = new BN(value);

              const halfExpected = valueBN.div(new BN('2'));
              const remExpected = valueBN.mod(new BN('2'));

              result.logs.length.should.be.equal(1);
              result.logs[0].event.should.be.equal('EventEtherSplitted');
              result.logs[0].args.caller.should.be.equal(alice);
              result.logs[0].args.beneficiary1.should.be.equal(bob);
              result.logs[0].args.beneficiary2.should.be.equal(carol);
              result.logs[0].args.splittedValue.should.be.eq.BN(halfExpected);
              result.logs[0].args.remainder.should.be.eq.BN(remExpected);

              const balanceBob = await splitterInstance.credit(bob);
              const balanceCarol = await splitterInstance.credit(carol);

              balanceBob.should.be.eq.BN(halfExpected);
              balanceCarol.should.be.eq.BN(halfExpected);
            });
          });

          it('split amounts correctly two times', async () => {
            const value = amounts[2];
            await splitterInstance.splitEthers( bob, carol,
                {from: alice, value: value, gas: MAX_GAS})
                .should.be.fulfilled;

            await splitterInstance.splitEthers( bob, carol,
                {from: alice, value: value, gas: MAX_GAS})
                .should.be.fulfilled;

            const valueBN = new BN(value);

            const creditExpected = valueBN.div(new BN('2')).mul(new BN('2'));
            const remExpected = valueBN.mod(new BN('2')).mul(new BN('2'));

            const balanceAlice = await splitterInstance.credit(alice);
            const balanceBob = await splitterInstance.credit(bob);
            const balanceCarol = await splitterInstance.credit(carol);

            balanceAlice.should.be.eq.BN(remExpected);
            balanceBob.should.be.eq.BN(creditExpected);
            balanceCarol.should.be.eq.BN(creditExpected);
          });
        });

        describe('fails', () => {
          it('if not called by owner ', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( alice, carol,
                  {from: bob, value: amounts[0], gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if first beneficiary is address(0)', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( ZERO_ADDRESS, carol,
                  {from: alice, value: amounts[0], gas: MAX_GAS});
            }, MAX_GAS);
          });

          it('if second beneficiary is address(0)', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return splitterInstance.splitEthers( bob, ZERO_ADDRESS,
                  {from: alice, value: amounts[0], gas: MAX_GAS});
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
                  {from: alice, value: amounts[0], gas: MAX_GAS});
            }, MAX_GAS);
          });
        });
      });

      describe('#withdraw()', () => {
        it('should allow withdraw and emit EventWithdraw', async () => {
          const value = amounts[2];

          await splitterInstance.splitEthers( bob, carol,
              {from: alice, value: value, gas: MAX_GAS})
              .should.be.fulfilled;

          const valueBN = new BN(value);

          const halfExpected = valueBN.div(new BN('2'));

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
          postBobBalance.should.be.eq.BN(preBobBalance.sub(totalGas).add(halfExpected));

          const bobCreditLeft = await splitterInstance.credit(bob);
          bobCreditLeft.should.be.eq.BN(0);
        });

        it('should fail if caller balance is zero', async () => {
          await web3.eth.expectedExceptionPromise(() => {
            return splitterInstance.withdraw({from: alice, gas: MAX_GAS});
          }, MAX_GAS);
        });

        it('should fail withdraws two times', async () => {

          await splitterInstance.splitEthers( bob, carol,
              {from: alice, value: amounts[2], gas: MAX_GAS})
              .should.be.fulfilled;

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
                  {from: address, value: amounts[0], gas: MAX_GAS});
            }, MAX_GAS);
          });
        });
      });
    });
  });
});
