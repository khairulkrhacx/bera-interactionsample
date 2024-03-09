import { ethers } from 'ethers'
import { readFileSync } from 'fs'
import delay from 'delay'
import 'dotenv/config'

const checkBalanceABI = ['function balanceOf(address) view returns (uint256)']
const provider = new ethers.JsonRpcProvider(`${process.env.RPC_URL}`)

const checkBalanceUSDC = async (privateKey) => {
  try {
    const ContractAddress = process.env.SC_USDC
    const wallet = new ethers.Wallet(privateKey, provider)
    const walletAddress = wallet.address

    const contract = new ethers.Contract(
      ContractAddress,
      checkBalanceABI,
      wallet
    )
    const balance = await contract.balanceOf(walletAddress)
    const balanceEther = ethers.formatUnits(balance, 18)
    const parse = parseFloat(balanceEther).toFixed(2)

    console.log(`Result : ${walletAddress} - ${parse} USDC`)
  } catch (error) {
    console.error(error)
  }
}

const mintHoney = async (privateKey) => {
  try {
    const ABI = ['function mint(address,address,uint256)']
    const ContractAddress = process.env.SC_POOLMINTHONEY
    const wallet = new ethers.Wallet(privateKey, provider)
    const walletAddress = wallet.address
    const randomAmount = Math.floor(Math.random() * 10) + 1

    const contract = new ethers.Contract(ContractAddress, ABI, wallet)
    const data = contract.interface.encodeFunctionData('mint', [
      `${walletAddress}`,
      '0x6581e59A1C8dA66eD0D313a0d4029DcE2F746Cc5',
      ethers.parseEther(`0.${randomAmount}122`),
    ])
    const transaction = {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits('1.5', 'gwei'),
      to: ContractAddress,
      data: data,
    }
    const txResponse = await wallet.sendTransaction(transaction)
    const receipt = await txResponse.wait()
    return receipt.status
  } catch (error) {
    console.error('Honey Mint failed. Try again...')
  }
}

const supply = async (privateKey) => {
  try {
    const ABI = ['function supply(address,uint256,address,uint16)']
    const ContractAddress = process.env.SC_POOLSUPPLYBORROW
    const wallet = new ethers.Wallet(privateKey, provider)
    const walletAddress = wallet.address
    const randomAmount = Math.floor(Math.random() * 10) + 1

    const contract = new ethers.Contract(ContractAddress, ABI, wallet)
    const data = contract.interface.encodeFunctionData('supply', [
      `${process.env.SC_HONEY}`,
      ethers.parseEther(`0.${randomAmount}`),
      walletAddress,
      0,
    ])
    const transaction = {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits('1.6', 'gwei'),
      to: ContractAddress,
      data: data,
    }
    const txResponse = await wallet.sendTransaction(transaction)
    const receipt = await txResponse.wait()

    return receipt.status
  } catch (error) {
    console.error('Supply failed. Try again...')
  }
}

;(async () => {
  try {
    const privateKey = readFileSync('./privatekey.txt', 'utf8').split('\n')
    for (let i = 0; i < privateKey.length; i++) {
      let a = privateKey[i].replace(/\s/g, '')
      console.log('Checking Balance USDC...')
      const myBalanceUSDC = await checkBalanceUSDC(a)
      if (myBalanceUSDC) console.log(myBalanceUSDC)
      console.log('Minting Honey...')

      let statusA = true
      while (statusA) {
        const myMintHoney = await mintHoney(a)
        if (myMintHoney == 1) {
          console.log('Honey Minted!')
          statusA = false
        }
        await delay(12000)
      }
      console.log('Supply Honey...')

      let statusB = true
      while (statusB) {
        const supplyStatus = await supply(a)
        if (supplyStatus == 1) {
          console.log('Supply Successful!')
          statusB = false
        }
        await delay(12000)
      }
    }
  } catch (error) {
    console.error(error)
  }
})()
