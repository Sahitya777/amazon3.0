require('@nomiclabs/hardhat-waffle')


task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})


const metamask_PRIVATE_KEY = "0x"+"f3703087c33b9bf5f11fd60905099bcb0a332edde714ff7bb3478e484ad0f641";


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url:'https://rinkeby.infura.io/v3/62041147011f44fb8ab226dc84629bfb',
      accounts: [metamask_PRIVATE_KEY],
    }
  }
};
