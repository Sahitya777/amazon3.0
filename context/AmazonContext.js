import { createContext,useState,useEffect } from "react";
import {useMoralis, useMoralisQuery} from 'react-moralis'
import { AmazonCoinAddress, amazonAbi } from "../lib/constants";
import { ethers } from "ethers";
export const AmazonContext=createContext()

export const AmazonProvider =({children})=>{
    const [username,setUsername]=useState('')
    const [nickname, setnickname] = useState('')
    const [assets,setAssets]=useState([])
    const [balance, setBalance] = useState('')
    const [tokenAmount, setTokenAmount] = useState('')
    const [amountDue, setAmountDue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [etherscanLink, setEtherscanLink] = useState('')
    const [currentAccount, setCurrentAccount] = useState('')
    const [recentTransactions, setRecentTransactions] = useState([])
    const [ownedItems, setOwnedItems] = useState([])

    const {
        authenticate,
        isAuthenticated,
        enableWeb3,
        Moralis,
        user,
        isWeb3Enabled,
    } = useMoralis()

    const {
      data:assetsData,
      error:assetsDataError,
      isLoading:assetsDataisLoading,
    }=useMoralisQuery('assets')

    const {
      data:userData,
      error:userDataError,
      isLoading:userDataisLoading
    }=useMoralisQuery('__user')
    
    const getAssets= async()=>{
      try{
        await enableWeb3()
        setAssets(assetsData)
      }catch(error){
        console.log(error);
      }
    }
    const getOwnedAssets=async ()=>{
      try{
        if(userData[0]){
          setOwnedItems(prevItems=>[
            ...prevItems,userData[0].attributes.ownedAssets
          ])
        }
      }catch(error){
        console.log(error);
      }
    }

    const listenToUpdates=async()=>{
        let query=new Moralis.Query('EthTransactions')
        let subscription=await query.subscribe()
        subscription.on('update',async object=>{
          console.log('New transaction')
          console.log(object)
          setRecentTransactions([object])
        })
    }
    

    const buyAssets=async(price,asset)=>{
      try{
        if(!isAuthenticated) return;

        const options={
          type:'erc20',
          amount:price,
          receiver:AmazonCoinAddress,
          contractAddress:AmazonCoinAddress
        }

        let transaction=await Moralis.transfer(options)
        const receipt=await transaction.wait()

        if(receipt){
          const res = userData[0].add('ownedAsset', {
            ...asset,
            purchaseDate: Date.now(),
            etherscanLink: `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`,
          })
          await res.save().then(()=>{
            alert("You've successfully purchased this asset!")
          })
        }
      }catch(error){
        console.log(error);
      }
    }

    const handleSetUsername = () => {
        if (user) {
          if (nickname) {
            user.set('nickname', nickname)
            user.save()
            setnickname('')
          } else {
            console.log("Can't set empty nickname")
          }
        } else {
          console.log('No user')
        }
      }


      const getBalance = async () => {
        try {
          if (!isAuthenticated || !currentAccount) return
          const options = {
            contractAddress: AmazonCoinAddress,
            functionName: 'balanceOf',
            abi: amazonAbi,
            params: {
              account: currentAccount,
            },
          }
    
          if (isWeb3Enabled) {
            const response = await Moralis.executeFunction(options)
            console.log(response.toString())
            setBalance(response.toString())
          }
        } catch (error) {
          console.log(error)
        }
      }
      const buyTokens = async () => {
        if (!isAuthenticated) {
          await connectWallet()
        }
    
        const amount = ethers.BigNumber.from(tokenAmount)
        const price = ethers.BigNumber.from('100000000000000')
        const calcPrice = amount.mul(price)
    
        console.log(AmazonCoinAddress)
    
        let options = {
          contractAddress: AmazonCoinAddress,
          functionName: 'mint',
          abi: amazonAbi,
          msgValue: calcPrice,
          params: {
            amount,
          },
        }
        const transaction = await Moralis.executeFunction(options)
        const receipt = await transaction.wait()
        setIsLoading(false)
        console.log(receipt)
        setEtherscanLink(
          `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`,
        )
      }
    
      useEffect(async()=>{
        await enableWeb3()
        await getOwnedAssets()
        await getAssets()
      },[assetsData,assetsDataisLoading]);
  
      useEffect(async ()=>{
        if(!isWeb3Enabled){
          await enableWeb3()
        }
        await listenToUpdates()
        if(isAuthenticated){
            await getBalance()

            const currentUsername = await user?.get('nickname')
            setUsername(currentUsername)
            const account=await user?.get('ethAddress')
            setCurrentAccount(account)
        }
      },[isWeb3Enabled,isAuthenticated,user,username,currentAccount,balance,setBalance])
  


    return(
        <AmazonContext.Provider
            value={{
                isAuthenticated,
                nickname,
                setnickname,
                username,
                setUsername,
                handleSetUsername,
                assets,
                balance,
                tokenAmount,
                setTokenAmount,
                amountDue,
                setAmountDue,
                setEtherscanLink,
                etherscanLink,
                currentAccount,
                isLoading,
                setIsLoading,
                buyTokens,
                buyAssets,
                recentTransactions,
                ownedItems,

            }}
        >
            {children}
        </AmazonContext.Provider>
    )
}