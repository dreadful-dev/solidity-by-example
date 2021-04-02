const { ethers, waffle } = require("hardhat"); 
const { expect } = require("chai");
const { ContractFactory } = require("ethers");
const provider = waffle.provider;

describe("Greeter", function() {
  it("Should return the new greeting once it's changed", async function() {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    
    await greeter.deployed();
    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("Event", function() {
  it("Should emit the event", async function() {
    const Event = await ethers.getContractFactory("Event");
    const event = await Event.deploy();
    await event.deployed();

    let tx = await event.test();
    await tx.wait();

    let logs = await web3.eth.getPastLogs({
      ...event.filters.Log(),
      fromBlock: 0,
      toBlock: 'latest'
    });

    // logs.forEach(log => {
    //   const _log = Event.interface.decodeEventLog('Log', log.data);
    //   console.log(_log.message);
    // });

    expect(logs.length).to.be.greaterThan(0);
  });
});

describe("Payable", function() {
  it("Is able to receive Eth", async function() {
    const Payable = await ethers.getContractFactory("Payable");
    const payable = await Payable.deploy();
    await payable.deployed();
    expect(await payable.balance()).to.be.equal("0");
    
    const overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("1.2")     // ether in this case MUST be a string
  
      // Or you can use Wei directly if you have that:
      // value: someBigNumber
      // value: 1234   // Note that using JavaScript numbers requires they are less than Number.MAX_SAFE_INTEGER
      // value: "1234567890"
      // value: "0x1234"
  
      // Or, promises are also supported:
      // value: provider.getBalance(addr)
    };

    let tx = await payable.deposit(overrides);
    await tx.wait();

    expect(await payable.balance()).to.be.equal(ethers.utils.parseEther("1.2"));
  });
});

describe("SendEther/ReceiveEther", function() {

  it("ReceiveEther is able to receive ether via signer", async function () {  
    const ReceiveEther = await ethers.getContractFactory("ReceiveEther");
    const receiveEther = await ReceiveEther.deploy();
    await receiveEther.deployed();

    expect(await receiveEther.balance()).to.be.equal("0");

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const tx = await signer.sendTransaction({
      to: receiveEther.address,
      value: ethers.utils.parseEther("0.2")
    });

    await tx.wait();

    expect(await receiveEther.balance()).to.be.equal(ethers.utils.parseEther("0.2"));
  });

  it("SendEther is able to send ether with sendViaCall", async function () {
    const SendEther = await ethers.getContractFactory("SendEther");
    const sendEther = await SendEther.deploy();
    await sendEther.deployed();
  
    const ReceiveEther = await ethers.getContractFactory("ReceiveEther");
    const receiveEther = await ReceiveEther.deploy();
    await receiveEther.deployed();

    expect(await receiveEther.balance()).to.be.equal("0");

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("0.5")     // ether in this case MUST be a string
    };

    let tx = await sendEther.sendViaCall(receiveEther.address, overrides);

    await tx.wait();

    expect(await receiveEther.balance()).to.be.equal(ethers.utils.parseEther("0.5"));
  });

  it("SendEther is able to send ether with sendViaSend", async function () {
    const SendEther = await ethers.getContractFactory("SendEther");
    const sendEther = await SendEther.deploy();
    await sendEther.deployed();
  
    const ReceiveEther = await ethers.getContractFactory("ReceiveEther");
    const receiveEther = await ReceiveEther.deploy();
    await receiveEther.deployed();

    expect(await receiveEther.balance()).to.be.equal("0");

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("0.5")     // ether in this case MUST be a string
    };

    let tx = await sendEther.sendViaSend(receiveEther.address, overrides);

    await tx.wait();

    expect(await receiveEther.balance()).to.be.equal(ethers.utils.parseEther("0.5"));
  });

  it("SendEther is able to send ether with sendViaTransfer", async function () {
    const SendEther = await ethers.getContractFactory("SendEther");
    const sendEther = await SendEther.deploy();
    await sendEther.deployed();
  
    const ReceiveEther = await ethers.getContractFactory("ReceiveEther");
    const receiveEther = await ReceiveEther.deploy();
    await receiveEther.deployed();

    expect(await receiveEther.balance()).to.be.equal("0");

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const overrides = {
      // To convert Ether to Wei:
      value: ethers.utils.parseEther("0.5")     // ether in this case MUST be a string
    };

    let tx = await sendEther.sendViaTransfer(receiveEther.address, overrides);

    await tx.wait();

    expect(await receiveEther.balance()).to.be.equal(ethers.utils.parseEther("0.5"));
  });

});

describe("CarFactory", function() {
  const CAR_MODEL = "Lambo";
  it("Creates a new car without Ether", async function() {
    const CarFactory = await ethers.getContractFactory("CarFactory");
    const carFactory = await CarFactory.deploy();
    let tx = await carFactory.create(carFactory.address, CAR_MODEL);
    await tx.wait();
    let [owner, model, balance] = await carFactory.getCar(0);

    expect(owner).to.be.equal(carFactory.address);
    expect(model).to.be.equal(CAR_MODEL);
    expect(balance.eq("0")).to.equal(true);
  });

  it("Creates a car and forwards Ether", async function() {
    const CarFactory = await ethers.getContractFactory("CarFactory");
    const carFactory = await CarFactory.deploy();
    const value = ethers.utils.parseEther("0.5");
    const overrides = { value };
    let tx = await carFactory.createAndSendEther(carFactory.address, CAR_MODEL, overrides);
    await tx.wait();
    let [owner, model, balance] = await carFactory.getCar(0);

    expect(owner).to.be.equal(carFactory.address);
    expect(model).to.be.equal(CAR_MODEL);
    expect(balance.eq(value)).to.equal(true);
  });
});

describe("Iterable Map", function() {
  it("Returns keys in mapping", async function() {
    const IterableMapping = await ethers.getContractFactory("IterableMapping");
    const iterableMapping = await IterableMapping.deploy();
    await iterableMapping.deployed();

    const IterableMapTest = await ethers.getContractFactory("IterableMapTest", { 
      libraries: {
        IterableMapping: iterableMapping.address
      }
    });
    const iterableMapTest = await IterableMapTest.deploy();
    await iterableMapTest.deployed();

    const tx = await iterableMapTest.testIterableMap();
    await tx.wait();

    const keys = await iterableMapTest.getKeys();
    expect(keys.length).to.be.equal(3);
  });
});

describe("MultiSigWallet", function() {
  let owner0;
  let owner1;
  let owner2;
  let other1;
  let addrs;
  let MultiSigWallet;
  let multiSigWallet;

  beforeEach(async function () {
    [owner0, owner1, owner2, other1, ...addrs] = await ethers.getSigners();
    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    multiSigWallet = await MultiSigWallet.deploy([owner0.address, owner1.address, owner2.address], 2);
    await multiSigWallet.deployed();
  });

  describe("submitTransaction", function() {
    it("can only be called by owner", async function() {

      await expect(
        multiSigWallet.connect(owner0).submitTransaction(other1.address, 1, [])
      ).to.not.be.reverted;
      
      await expect(
        multiSigWallet.connect(other1).submitTransaction(other1.address, 1, [])
      ).to.be.revertedWith("not owner");
    });

    it("submits transaction to wallet", async function() {
      expect(await multiSigWallet.getTransactionCount()).to.be.equal(0);

      await expect(
        multiSigWallet.connect(owner0).submitTransaction(other1.address, 1, [])
      ).to.not.be.reverted;

      expect(await multiSigWallet.getTransactionCount()).to.be.equal(1);
    });
  });

  describe("confirmTransaction", function() {
    it("Only confirms after enough signers confirm", async function() {
      const ReceiveEther = await ethers.getContractFactory("ReceiveEther");
      const receiveEther = await ReceiveEther.deploy();
      await receiveEther.deployed();
      
      await expect(owner0.sendTransaction({
        to: multiSigWallet.address,
        value: ethers.utils.parseEther("1.2")
      })).to.not.be.reverted;
  
      await expect(
        multiSigWallet.connect(owner0).submitTransaction(receiveEther.address, 1, [])
      ).to.not.be.reverted;

      await expect(
        multiSigWallet.connect(owner0).confirmTransaction(0)
      ).to.not.be.reverted;

      await expect(
        multiSigWallet.connect(owner0).executeTransaction(0)
      ).to.be.revertedWith("cannot execute tx");

      await expect(
        multiSigWallet.connect(owner1).confirmTransaction(0)
      ).to.not.be.reverted;

      await expect(
        multiSigWallet.connect(other1).executeTransaction(0)
      ).to.not.be.reverted;
    })
  });
});