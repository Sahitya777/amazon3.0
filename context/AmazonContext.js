import { createContext,useState,useEffect } from "react";
import {useMoralis, useMoralisQuery} from 'react-moralis'

export const AmazonContext=createContext()

export const AmazonProvider =({children})=>{
    const [username,setUsername]=useState('')
    const [nickname, setnickname] = useState('')
    const [assets,setAssets]=useState([])

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
          const currentUsername = await user?.get('nickname')
          setUsername(currentUsername)
      }
    },[isWeb3Enabled,isAuthenticated,user,username])



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



    return(
        <AmazonContext.Provider
            value={{
                isAuthenticated,
                nickname,
                setnickname,
                username,
                setUsername,
                handleSetUsername,
                assets
            }}
        >
            {children}
        </AmazonContext.Provider>
    )
}