const Splitter = artifacts.require('./Splitter.sol');


module.exports = async (deployer, network, accounts) => {
 //const owner = accounts[0];
 // await deployer.deploy(Splitter, {from: owner});
 await deployer.deploy(Splitter);
};


