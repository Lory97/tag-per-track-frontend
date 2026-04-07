import { Injectable, signal } from '@angular/core';
import { createConfig, http, connect, writeContract, waitForTransactionReceipt, getAccount, injected, signTypedData } from '@wagmi/core';
import { base, baseSepolia } from '@wagmi/core/chains';
import { parseUnits, bytesToHex, erc20Abi } from 'viem';

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export interface X402PaymentPayload {
  signature: string;
  authorization: {
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  address = signal<string | null>(null);
  isConnected = signal<boolean>(false);
  chainId = signal<number | null>(null);

  // Address for USDC on Base
  private usdcAddresses: Record<number, `0x${string}`> = {
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet USDC
    84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
  };

  constructor() {
    this.checkConnection();
  }

  checkConnection() {
    const account = getAccount(wagmiConfig);
    if (account.isConnected) {
      this.address.set(account.address || null);
      this.chainId.set(account.chainId || null);
      this.isConnected.set(true);
    }
  }

  async connectWallet() {
    try {
      const result = await connect(wagmiConfig, { connector: injected() });
      this.address.set(result.accounts[0]);
      this.chainId.set(result.chainId);
      this.isConnected.set(true);
      return result;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async signX402Payment(amountStr: string, destination: string): Promise<X402PaymentPayload> {
    if (!this.isConnected()) {
      await this.connectWallet();
    }

    const account = getAccount(wagmiConfig);
    if (!account.address) throw new Error("Wallet not connected");

    const currentChainId = account.chainId || base.id;
    const usdcAddress = this.usdcAddresses[currentChainId] || this.usdcAddresses[8453];

    try {
      // Amount in smallest unit (wei) format string
      const amountWei = parseUnits(amountStr, 6).toString();

      const nonceBytes = new Uint8Array(32);
      window.crypto.getRandomValues(nonceBytes);
      const nonce = bytesToHex(nonceBytes);

      const validAfter = "0";
      // Valid for the next 1 hour (unix timestamp)
      const validBefore = Math.floor(Date.now() / 1000 + 3600).toString();

      // USD Coin Typed Data structure for Base
      const domain = {
        name: currentChainId === 8453 ? 'USD Coin' : 'USDC',
        version: '2',
        chainId: currentChainId,
        verifyingContract: usdcAddress as `0x${string}`,
      } as const;

      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      } as const;

      const message = {
        from: account.address,
        to: destination as `0x${string}`,
        value: BigInt(amountWei),
        validAfter: BigInt(validAfter),
        validBefore: BigInt(validBefore),
        nonce: nonce as `0x${string}`,
      };

      const signature = await signTypedData(wagmiConfig, {
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message,
      });

      return {
        signature,
        authorization: {
          from: account.address,
          to: destination,
          value: amountWei,
          validAfter,
          validBefore,
          nonce
        }
      };

    } catch (error) {
      console.error('Payment signature failed:', error);
      throw error;
    }
  }
}
