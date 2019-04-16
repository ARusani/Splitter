/* eslint-disable one-var */
'use strict';

web3.eth.getTransactionReceiptMined = require('../gistLepretre/getTransactionReceiptMined.js');
web3.eth.expectedExceptionPromise = require('../gistLepretre/expected_exception_testRPC_and_geth.js');

const {BN, toWei, sha3} = web3.utils;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

require('chai')
    .use(require('chai-as-promised'))
    .should();

const Stoppable = artifacts.require('Stoppable.sol');

contract('Stoppable', function(accounts) {
  const MAX_GAS = '4700000';

  let coinbase, user1, owner;
  before('checking accounts', async () => {
    assert.isAtLeast(accounts.length, 5, 'not enough accounts');

    coinbase = await web3.eth.getCoinbase();

    const coinbaseIndex = await accounts.indexOf(coinbase);
    // Remove the coinbase account
    if (coinbaseIndex > -1) {
      accounts.splice(coinbaseIndex, 1);
    }
    [owner, user1] = accounts;
  });

  describe('#Stoppable()', () => {
    describe('Test Stoppable Instance methods:', () => {
      let stoppableInstance, stoppableInstanceStopped;

      beforeEach('should deploy Stoppable instance', async () => {
        stoppableInstanceStopped = await Stoppable.new(
            {from: owner}).should.be.fulfilled;

        await stoppableInstanceStopped.stop({from: owner})
            .should.be.fulfilled;
      });

      beforeEach('should deploy Stoppable instance', async () => {
        stoppableInstance = await Stoppable.new(
            {from: owner}).should.be.fulfilled;
      });

      describe('#stop()', () => {
        describe('allowed', () => {
          it('if owner stop unstopped contact', async () => {
            const result = await stoppableInstance.stop({from: owner})
                .should.be.fulfilled;

            result.logs.length.should.be.equal(1);
            result.logs[0].event.should.be.equal('EventStopped');

            const isStopped = await stoppableInstance.stopped();
            isStopped.should.be.true;
          });

          it('if owner unStop stopped contact', async () => {
            await stoppableInstanceStopped.unStop({from: owner})
                .should.be.fulfilled;
            const result = await stoppableInstance.stopped();
            result.should.be.false;
          });
        });

        describe('fail', () => {
          it('if owner stop a stopped contact', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return stoppableInstanceStopped.stop({from: owner});
            }, MAX_GAS);

            const isStopped = await stoppableInstanceStopped.stopped();
            isStopped.should.be.true;
          });

          it('if owner unStop unstopped contact', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return stoppableInstance.unStop({from: owner});
            }, MAX_GAS);

            const result = await stoppableInstance.stopped();
            result.should.be.false;
          });

          it('if non owner stop a unstopped contact', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return stoppableInstance.stop({from: user1});
            }, MAX_GAS);

            const isStopped = await stoppableInstance.stopped();
            isStopped.should.be.false;
          });

          it('if non owner unStop stopped contact', async () => {
            await web3.eth.expectedExceptionPromise(() => {
              return stoppableInstanceStopped.unStop({from: user1});
            }, MAX_GAS);

            const result = await stoppableInstanceStopped.stopped();
            result.should.be.true;
          });
        });
      });
    });
  });
});
