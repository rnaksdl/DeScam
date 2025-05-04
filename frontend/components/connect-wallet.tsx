"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { contractService } from "@/services/contract"

export function ConnectWallet() {
  const [account, setAccount] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [pendingRequest, setPendingRequest] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || "")
      setPendingRequest(false)
      setErrorMsg("")
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [])

  const connectWallet = async () => {
    setErrorMsg("")
    setPendingRequest(false)
    if (typeof window === "undefined" || !window.ethereum) {
      setErrorMsg("MetaMask is not installed. Please install MetaMask and try again.")
      return
    }
    setIsConnecting(true)
    try {
      // Only call eth_requestAccounts on user action
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setAccount(accounts[0])
      await contractService.connect()
    } catch (error: any) {
      if (error.code === -32002) {
        setPendingRequest(true)
        setErrorMsg(
          "MetaMask is already processing a connection request. " +
          "If you don't see a popup, please click the MetaMask extension icon in your browser to approve or reject the pending request. " +
          "After resolving, you can try again."
        )
      } else if (error.code === 4001) {
        setErrorMsg("You rejected the connection request.")
      } else {
        setErrorMsg("Error connecting to MetaMask. Please try again.")
      }
      console.error("Error connecting to MetaMask:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const tryAgain = () => {
    setErrorMsg("")
    setPendingRequest(false)
    connectWallet()
  }

  return (
    <div>
      <Button
        onClick={connectWallet}
        disabled={isConnecting || !!account || pendingRequest}
      >
        {isConnecting
          ? "Connecting..."
          : account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : pendingRequest
          ? "Pending..."
          : "Connect Wallet"}
      </Button>
      {errorMsg && (
        <div className="mt-2 text-sm text-red-600">
          {errorMsg}
          {pendingRequest && (
            <div className="mt-2 flex flex-col gap-2">
              <span>
                <strong>Tip:</strong> If you don't see a popup, click the MetaMask extension icon in your browser.
              </span>
              <Button variant="outline" size="sm" onClick={tryAgain}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
