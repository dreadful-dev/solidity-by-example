// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Car {
    address public owner;
    string public model;

    constructor(address _owner, string memory _model) payable {
        owner = _owner;
        model = _model;
    }
}

