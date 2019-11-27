import { ethers } from 'ethers'
// import SVG_HASH_ABI from 'constants/abis/SvgHash'
import ARTICLE_STORE_ABI from 'constants/abis/ArticleStore'
import ARTICLE_ADMIN_ABI from 'constants/abis/ArticleAdmin'
import ARTICLE_INFO_ABI from 'constants/abis/ArticleInfo'
import ARTICLE_ENUMABLE_ABI from 'constants/abis/ArticleEnumable'
import NAME_REGISTER_ABI from 'constants/abis/NameRegister'
import ARTICLE_LNG_ABI from 'constants/abis/ArticleLngEnumable'
import SVG_HASH_NEW_ABI from 'constants/abis/SvgHashNew'
import SVG_ADMIN_ABI from 'constants/abis/SvgAdmin'

import { ARTICLE_STORE_ADDRESS,ARTICLE_INFO_ADDRESS,ARTICLE_ENUMABLE_ADDRESS,SVG_ADMIN_ADDRESS,
        ARTICLE_ADMIN_ADDRESS, NAME_REGISTER_ADDRESS,ARTICLE_LNG_ADDRESS,SVG_HASH_NEW_ADDRESS } from '../constants'
import UncheckedJsonRpcSigner from './signer'

export const ERROR_CODES = ['TOKEN_NAME', 'TOKEN_SYMBOL', 'TOKEN_DECIMALS'].reduce(
  (accumulator, currentValue, currentIndex) => {
    accumulator[currentValue] = currentIndex
    return accumulator
  },
  {}
)

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

export const NETWORK_NAME = {
    1:'mainnet',
    3:"ropsten",
    4:"rinkeby",
    5:"goerli",
    42:'kovan',
}


const ETHERSCAN_PREFIXES = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.'
}
export function getEtherscanLink(networkId, data, type) {
  const prefix = `https://${ETHERSCAN_PREFIXES[networkId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export function getNetworkName(networkId) {
  switch (networkId) {
    case 1: {
      return 'the Main Ethereum Network'
    }
    case 3: {
      return 'the Ropsten Test Network'
    }
    case 4: {
      return 'the Rinkeby Test Network'
    }
    case 5: {
      return 'the Görli Test Network'
    }
    case 42: {
      return 'the Kovan Test Network'
    }
    case 5777:{
      return 'the localhost'
    }
    default: {
      return 'the correct network'
    }
  }
}

export function shortenAddress(address, digits = 4) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${address.substring(0, digits + 2)}...${address.substring(42 - digits)}`
}

export function shortenTransactionHash(hash, digits = 4) {
  return `${hash.substring(0, digits + 2)}...${hash.substring(66 - digits)}`
}

export function isAddress(value) {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export function calculateGasMargin(value, margin) {
  const offset = value.mul(margin).div(ethers.utils.bigNumberify(10000))
  return value.add(offset)
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? new UncheckedJsonRpcSigner(library.getSigner(account)) : library
}

// account is optional
export function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === ethers.constants.AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return new ethers.Contract(address, ABI, getProviderOrSigner(library, account))
}

// export function getSvgHashContract(networkId,library,account){
//     return getContract(SVG_HASH_ADDRESS[networkId], SVG_HASH_ABI, library, account)
// }

export function getSvgHashNewContract(networkId,library,account){
    return getContract(SVG_HASH_NEW_ADDRESS[networkId], SVG_HASH_NEW_ABI, library, account)
}

export function getSvgAdminContract(networkId,library,account){
    return getContract(SVG_ADMIN_ADDRESS[networkId], SVG_ADMIN_ABI, library, account)
}

export function getArticleStoreContract(networkId,library,account){
    return getContract(ARTICLE_STORE_ADDRESS[networkId], ARTICLE_STORE_ABI, library, account)
}

export function getNameRegisterContract(networkId,library,account){
    return getContract(NAME_REGISTER_ADDRESS[networkId], NAME_REGISTER_ABI, library, account)
}

export function getArticleAdminContract(networkId,library,account){
    return getContract(ARTICLE_ADMIN_ADDRESS[networkId], ARTICLE_ADMIN_ABI, library, account)
}

export function getArticleInfoContract(networkId,library,account){
    return getContract(ARTICLE_INFO_ADDRESS[networkId], ARTICLE_INFO_ABI, library, account)
}

export function getArticleEnumableContract(networkId,library,account){
    return getContract(ARTICLE_ENUMABLE_ADDRESS[networkId], ARTICLE_ENUMABLE_ABI, library, account)
}

export function getArticleLngContract(networkId,library,account) {
    return getContract(ARTICLE_LNG_ADDRESS[networkId],ARTICLE_LNG_ABI,library,account)
}

export function getPathBase() {
    return process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PATH_BASE : ''
}

export function convertTimetoTimeString(_times) {
        let now = new Date(_times),
            y = now.getFullYear(),
            m = now.getMonth() + 1,
            d = now.getDate();
        return y + "-" + (
            m < 10
            ? "0" + m
            : m) + "-" + (
            d < 10
            ? "0" + d
            : d) + " " + now.toTimeString().substr(0, 8);
}

export function getIndexArray(amount,pagesize,_offset){
     let result = []
     let start = _offset
     if(start > amount -1) {
         return result
     }
     let end = _offset + pagesize - 1
     if(end > amount -1)
       end = amount -1
     for(let i=start;i<=end;i++)
       result.push(i)
     return result
 }

export function getIndexArrayReverse(amount,pagesize,offset){
     let start = amount - offset -1
     if(start <0)
         return []
     let end = start - pagesize + 1
     if(end <= 0)
         end = 0
     let result = []
     for(let i=start;i>=end;i--){
         result.push(i)
     }
     return result
 }
