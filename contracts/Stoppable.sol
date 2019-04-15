pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Stoppable is Ownable {

    event EventStopped(address indexed caller);
    event EventUnStopped(address indexed caller);

    bool public stopped;

    modifier notStopped() {
        require(!stopped);
        _;
    }

    modifier asStopped() {
        require(stopped);
        _;
    }

    constructor () internal {}

    function stop() public onlyOwner notStopped  {
        stopped = true;

        emit EventStopped(msg.sender);
    }

    function unStop() public onlyOwner asStopped {
        stopped = false;
        emit EventUnStopped(msg.sender);
    }

    function isStopped() public view returns (bool) {
        return stopped;
    }    
}