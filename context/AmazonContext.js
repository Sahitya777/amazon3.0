import { createContext,useState,useEffect } from "react";
import {useMoralis} from 'react-moralis'

export const AmazonContext=createContext()

export const AmazonProvider =({children})=>{
    const [username,setUsername]=useState('')
    const [nickname, setnickname] = useState('')

    const {
        authenticate,
        isAuthenticated,
        enableWeb3,
        Moralis,
        user,
        isWeb3Enabled,
    } = useMoralis()
    
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
      useEffect(async ()=>{
        if(isAuthenticated){
            const currentUsername = await user?.get('nickname')
            setUsername(currentUsername)
        }
      },[isAuthenticated,user,username])


    return(
        <AmazonContext.Provider
            value={{
                isAuthenticated,
                nickname,
                setnickname,
                username,
                setUsername,
                handleSetUsername
            }}
        >
            {children}
        </AmazonContext.Provider>
    )
}