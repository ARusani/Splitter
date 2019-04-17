/* eslint-disable max-len */
/* eslint-disable one-var */
/* eslint-disable require-jsdoc */

window.addEventListener('load', async () => {
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
  }

  console.log(window.web3.version.api);

  const accounts = await window.web3.eth.accounts;
  const alice = accounts[0];
  const bob = accounts[1];
  const carol = accounts[2];
  console.log('Attempting to deploy from account', accounts);


  const SplitterContract = web3.eth.contract([
    {
      'constant': false,
      'inputs': [],
      'name': 'stop',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function',
      'signature': '0x07da68f5'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'isStopped',
      'outputs': [
        {
          'name': '',
          'type': 'bool'
        }
      ],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function',
      'signature': '0x3f683b6a'
    },
    {
      'constant': false,
      'inputs': [],
      'name': 'unStop',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function',
      'signature': '0x52486654'
    },
    {
      'constant': false,
      'inputs': [],
      'name': 'renounceOwnership',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function',
      'signature': '0x715018a6'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'owner',
      'outputs': [
        {
          'name': '',
          'type': 'address'
        }
      ],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function',
      'signature': '0x8da5cb5b'
    },
    {
      'constant': true,
      'inputs': [],
      'name': 'isOwner',
      'outputs': [
        {
          'name': '',
          'type': 'bool'
        }
      ],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function',
      'signature': '0x8f32d59b'
    },
    {
      'constant': true,
      'inputs': [
        {
          'name': '',
          'type': 'address'
        }
      ],
      'name': 'credit',
      'outputs': [
        {
          'name': '',
          'type': 'uint256'
        }
      ],
      'payable': false,
      'stateMutability': 'view',
      'type': 'function',
      'signature': '0xd5d44d80'
    },
    {
      'constant': false,
      'inputs': [
        {
          'name': 'newOwner',
          'type': 'address'
        }
      ],
      'name': 'transferOwnership',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function',
      'signature': '0xf2fde38b'
    },
    {
      'inputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'constructor',
      'signature': 'constructor'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': 'caller',
          'type': 'address'
        }
      ],
      'name': 'EventSplitterCreated',
      'type': 'event',
      'signature': '0xeaa38c1da9a5a7804ce694794a8da099db876d00d8ff591d5236a6421c9330f9'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': 'caller',
          'type': 'address'
        },
        {
          'indexed': false,
          'name': 'beneficiary1',
          'type': 'address'
        },
        {
          'indexed': false,
          'name': 'beneficiary2',
          'type': 'address'
        },
        {
          'indexed': false,
          'name': 'splittedValue',
          'type': 'uint256'
        },
        {
          'indexed': false,
          'name': 'remainder',
          'type': 'uint256'
        }
      ],
      'name': 'EventEtherSplitted',
      'type': 'event',
      'signature': '0x2f86fdf32f263334aba74ce1634cdf359d907714e308d2af65ae5ad3614e4544'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': 'caller',
          'type': 'address'
        },
        {
          'indexed': false,
          'name': 'balance',
          'type': 'uint256'
        }
      ],
      'name': 'EventWithdraw',
      'type': 'event',
      'signature': '0x41caea7d684d5ba5fba1924d54c5169a147971fb5ffdde987624e8bbd450828b'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': 'caller',
          'type': 'address'
        }
      ],
      'name': 'EventStopped',
      'type': 'event',
      'signature': '0x431c6f6c58ff41e8cee840a02edad857e13381cd6b0772cc84dc0edfcc683592'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': 'caller',
          'type': 'address'
        }
      ],
      'name': 'EventUnStopped',
      'type': 'event',
      'signature': '0x3f11058ac63f39665f9d62070804230a03741b733b8c4d0c6f6e069949dda8b6'
    },
    {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'name': 'previousOwner',
          'type': 'address'
        },
        {
          'indexed': true,
          'name': 'newOwner',
          'type': 'address'
        }
      ],
      'name': 'OwnershipTransferred',
      'type': 'event',
      'signature': '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0'
    },
    {
      'constant': false,
      'inputs': [
        {
          'name': 'beneficiary1',
          'type': 'address'
        },
        {
          'name': 'beneficiary2',
          'type': 'address'
        }
      ],
      'name': 'splitEthers',
      'outputs': [],
      'payable': true,
      'stateMutability': 'payable',
      'type': 'function',
      'signature': '0xcd04ab34'
    },
    {
      'constant': false,
      'inputs': [],
      'name': 'withdraw',
      'outputs': [],
      'payable': false,
      'stateMutability': 'nonpayable',
      'type': 'function',
      'signature': '0x3ccfd60b'
    }
  ]);
  const SplitterAddress = '0xdf649A4f4D601eBF4D817B9E9dcaE02CD60eb89f';
  const SplitterInstance = SplitterContract.at(SplitterAddress);

  await refreshBalance();

  $('#splitEthers').click( async () => {
    $('#loader').show();
    try {
      const result = await SplitterInstance.splitEthers(bob, carol, {from: alice, value: $('#Ethers').val()});
      console.log(result.toString());
      $('#loader').hide();
    } catch (error) {
      $('#loader').hide();
      $('#contractBalance').html(error.toString());
    };
  });

  try {
    SplitterInstance.EventEtherSplitted({}, 'latest').watch((error, log) => {
      if (!error) {
        console.log('Watched Log:', log.args);
        refreshBalance();
      } else {
        $('#loader').hide();
        console.log('Watched Error:', error);
      }
    });

    SplitterInstance.EventWithdraw({}, 'latest').watch((error, log) => {
      if (!error) {
        console.log('Watched Log:', log.args);
        refreshBalance();
      } else {
        $('#loader').hide();
        console.log('Watched Error:', error);
      }  
    });
  } catch (error) {
    $('#loader').hide();
    $('#contractBalance').html(error.toString());
  };


  $('#withdrawBob').click( async () => {
    $('#loader').show();
    await clickButton(bob);
  });

  $('#withdrawCarol').click(async () => {
    $('#loader').show();
    await clickButton(carol);
  });

  async function clickButton(anAddress) {
    try {
      const result = await SplitterInstance.withdraw({from: anAddress});
      console.log(result);
      $('#loader').hide();
    } catch (error) {
      $('#loader').hide();
      $('#contractBalance').html(error.toString());
    };
  };

  async function refreshBalance() {
    try {
      const result = await web3.eth.getBalance( SplitterAddress);
      console.log('Balance Result: ',result.toString());
      $('#contractBalance').html(result.toString() + ' Total Ethers in the contract');
    } catch (error) {
      $('#loader').hide();
      $('#contractBalance').html(error.toString());
    };

    const addesses = [
      {'address': bob, 'tag': '#bobBalance'},
      {'address': carol, 'tag': '#carolBalance'},
    ];

    addesses.forEach(async (anAddress) => {
      try {
        const result = await SplitterInstance.credit(anAddress.address);
        console.log(anAddress.address + ' = ' +result.toString());
        $(anAddress.tag).html(result.toString());
      } catch (error) {
        $('#loader').hide();
        $('#contractBalance').html(error.toString());
      };
    });
  };
});
