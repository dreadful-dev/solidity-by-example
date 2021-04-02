//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Event {
    // Event declaration
    // Up to 3 parameters can be indexed.
    // Indexed parameters helps you filter the logs by the indexed parameter
    event Log(address indexed sender, string message, uint index);
    event AnotherLog();

    uint index = 0;

    function test() public {
        emit Log(msg.sender, "Hello From Ethereum Logs! ", index);
        index += 1;
    }
}