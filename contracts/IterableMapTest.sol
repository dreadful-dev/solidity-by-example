// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './IterableMapping.sol';

contract IterableMapTest {
  using IterableMapping for IterableMapping.Map;
  IterableMapping.Map private map;

  function getKeys() public view returns (address[] memory) {
    address[] memory keys = new address[](map.size());

    for (uint i = 0; i < map.size(); i++) {
      address key = map.getKeyAtIndex(i);
      keys[i] = key;
    }

    return keys;
  }

  function testIterableMap() public {
    map.set(address(0), 0);
    map.set(address(1), 100);
    map.set(address(2), 200); // insert
    map.set(address(2), 200); // update
    map.set(address(3), 300);

    for (uint i = 0; i < map.size(); i++) {
      address key = map.getKeyAtIndex(i);
      assert(map.get(key) == i * 100);
    }

    map.remove(address(1));

    // keys = [address(0), address(3), address(2)]
    assert(map.size() == 3);
    assert(map.getKeyAtIndex(0) == address(0));
    assert(map.getKeyAtIndex(1) == address(3));
    assert(map.getKeyAtIndex(2) == address(2));
  }
}