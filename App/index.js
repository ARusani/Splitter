if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
}
web3.eth.defaultAccount = web3.eth.accounts[0];

const alice = web3.eth.accounts[0];
const bob = web3.eth.accounts[1];
const carol = web3.eth.accounts[2];


const SplitterContract = web3.eth.contract([
  {
    'constant': false,
    'inputs': [],
    'name': 'renounceOwnership',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
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
    'type': 'function'
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
    'type': 'function'
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
    'type': 'function'
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
    'type': 'function'
  },
  {
    'inputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'constructor'
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
    'type': 'event'
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
    'type': 'event'
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
    'type': 'event'
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
    'type': 'event'
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
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [],
    'name': 'withdraw',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
]);
const SplitterAddress = '0x6693506bba44aa5434b967C912AFF0405BaFad8B';
const SplitterInstance = SplitterContract.at(SplitterAddress);

refreshBalance();

$('#splitEthers').click(function() {
  $('#loader').show();
  SplitterInstance.splitEthers(bob, carol, {from: alice, value: $('#Ethers').val()}, function(err, res) {
    if (err) {
      $('loader').hide();
      console.log(err);
    }
  });
});

SplitterInstance.EventEtherSplitted({}, 'latest').watch(function(error, result) {
  if (!error) {
    $('#loader').hide();

    refreshBalance();
  } else {
    $('#loader').hide();
  }
  console.error(error);
});

$('#withdrawBob').click(function() {
  $('#loader').show();
  SplitterInstance.withdraw({from: bob}, function(err) {
    if (err) {
      $('loader').hide();
      console.log(err);
    }
  });
});

$('#withdrawCarol').click(function() {
  $('#loader').show();
  SplitterInstance.withdraw({from: carol}, function(err, res) {
    if (err) {
      $('loader').hide();
      console.log(err);
    }
  });
});

SplitterInstance.EventWithdraw({}, 'latest').watch(function(error, result) {
  if (!error) {
    $('#loader').hide();

    refreshBalance();
  } else {
    $('#loader').hide();
  }
  console.error(error);
});

function refreshBalance() {
  web3.eth.getBalance( SplitterAddress, function(error, result) {
    if (!error) {
      $('#contractBalance').html('<h2 id="contractBalance">' + result.toString() + ' Total Eheters in the contract</h2>');
      console.log(result.toString());
    } else {
      console.error(error);
    }
  });


  SplitterInstance.credit.call(bob, function(error, result) {
    if (!error) {
      $('#bobBalance').html('<p id="bobBalance">' + result.toString() + '</p>');
      console.log(result.toString());
    } else {
      console.error(error);
    }
  });

  SplitterInstance.credit.call(carol, function(error, result) {
    if (!error) {
      $('#carolBalance').html('<p id="carolBalance">' + result.toString() + '</p>');
      console.log(result.toString());
    } else {
      console.error(error);
    }
  });
};
