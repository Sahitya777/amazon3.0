import { createContext,useState,useEffect } from "react";
import {useMoralis, useMoralisQuery} from 'react-moralis'
import { amazonAbi,amazonCoinAddress } from "../lib/constants";
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
    
    const getAssets= async()=>{
      try{
        await enableWeb3()
        setAssets(assetsData)
      }catch(error){
        console.log(error);
      }
    }
    
    useEffect(async()=>{
      await enableWeb3()
      await getAssets()
    },[assetsData,assetsDataisLoading])

    useEffect(async ()=>{
      if(!isWeb3Enabled){
        await enableWeb3()
      }
      if(isAuthenticated){
          await getBalance()
          const currentUsername = await user?.get('nickname')
          setUsername(currentUsername)
          const account=await user?.get('ethAddress')
          setCurrentAccount(account)
      }
    },[isWeb3Enabled,isAuthenticated,user,username,currentAccount])



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

      const getBalance=async()=>{
        try{
          if(!isAuthenticated || currentAccount){
            return;
          }
          const options={
            contractAddress:amazonCoinAddress,
            functionName:'balanceOf',
            abi:amazonAbi,
            params:{
              account:currentAccount
            },


          }
          if(isWeb3Enabled){
            const response=await Moralis.executeFunction(options)
            setBalance(response.toString())
          }
        }catch(error){
          console.log(error);
        }
      }

      const buyTokens=async()=>{
        if(!isAuthenticated){
          await authenticate()
        }
        const amount=ethers.BigNumber.from(tokenAmount);
        const price = ethers.BigNumber.from('100000000000000')
        const calcPrice = amount.mul(price)

        let options = {
          contractAddress: amazonCoinAddress,
          functionName: 'mint',
          abi: amazonAbi,
          msgValue: calcPrice,
          params: {
            amount,
          },
        }
      const transaction = await Moralis.executeFunction(options)
      const receipt = await transaction.wait(4)
      setIsLoading(false)
      console.log(receipt)
      setEtherscanLink(
        `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`,
      )
      }



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
                buyTokens
            }}
        >
            {children}
        </AmazonContext.Provider>
    )
}