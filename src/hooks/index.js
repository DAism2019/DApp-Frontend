import { useState, useMemo, useCallback, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import { getArticleStoreContract,getArticleAdminContract,getArticleInfoContract,getSvgAdminContract,
    getArticleEnumableContract, getNameRegisterContract,getArticleLngContract,getSvgHashNewContract } from '../utils'
// modified from https://usehooks.com/useDebounce/
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// modified from https://usehooks.com/useKeyPress/
export function useBodyKeyDown(targetKey, onKeyDown, suppressOnKeyDown = false) {
  const downHandler = useCallback(
    event => {
      const {
        target: { tagName },
        key
      } = event
      if (key === targetKey && tagName === 'BODY' && !suppressOnKeyDown) {
        event.preventDefault()
        onKeyDown()
      }
    },
    [targetKey, onKeyDown, suppressOnKeyDown]
  )

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [downHandler])
}

// export function useSvgHashContract(withSignerIfPossible = true) {
//   const { networkId, library, account } = useWeb3Context()
//
//   return useMemo(() => {
//     try {
//       return getSvgHashContract(networkId, library, withSignerIfPossible ? account : undefined)
//     } catch {
//       return null
//     }
//   }, [networkId, library, withSignerIfPossible, account])
// }

export function useSvgHashNewContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getSvgHashNewContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}

export function useSvgAdminContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getSvgAdminContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}



export function useArticleStoreContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getArticleStoreContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}

export function useArticleAdminContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getArticleAdminContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}

export function useArticleInfoContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getArticleInfoContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}

export function useArticleEnumableContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getArticleEnumableContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}

export function useArticleLngContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getArticleLngContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}



export function useNameRegisterContract(withSignerIfPossible = true) {
  const { networkId, library, account } = useWeb3Context()

  return useMemo(() => {
    try {
      return getNameRegisterContract(networkId, library, withSignerIfPossible ? account : undefined)
    } catch {
      return null
    }
  }, [networkId, library, withSignerIfPossible, account])
}
