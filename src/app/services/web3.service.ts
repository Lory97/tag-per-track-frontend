import { Injectable, signal, NgZone, inject } from '@angular/core';
import { getAccount, signTypedData, watchAccount, reconnect } from '@wagmi/core';
import { base, baseSepolia } from '@reown/appkit/networks';
import { parseUnits, bytesToHex } from 'viem';
import { Attribution } from 'ox/erc8021';
import { AppKit, createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const BUILDER_CODE = 'bc_3tdradhx';

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});

export const projectId = 'e1d5c7d330f7223441c9d26cff15524b';
export const networks = [base, baseSepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
(wagmiConfig as any).dataSuffix = DATA_SUFFIX;

const metadata = {
  name: 'Tag-per-Track',
  description: 'Agentic-First Musical Audio Analysis',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://tag-per-track.cloud', 
  icons: ['https://tag-per-track.cloud/favicon.png']
};

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
  private ngZone = inject(NgZone);

  address = signal<string | null>(null);
  isConnected = signal<boolean>(false);
  chainId = signal<number | null>(null);

  modal: AppKit;

  // Address for USDC on Base
  private usdcAddresses: Record<number, `0x${string}`> = {
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet USDC
    84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
  };

  constructor() {
    this.modal = createAppKit({
      adapters: [wagmiAdapter],
      networks: [base, baseSepolia] as any,
      metadata,
      projectId,
      features: {
        analytics: true
      }
    });

    // Watch for wallet state changes — run inside NgZone so Angular detects signal updates
    watchAccount(wagmiConfig, {
      onChange: (account) => {
        this.ngZone.run(() => {
          this.syncAccount(account);
        });
      }
    });

    // Attempt to reconnect any persisted session from localStorage
    this.ngZone.runOutsideAngular(() => {
      reconnect(wagmiConfig).catch(() => {});
    });

    // Sync initial state + delayed re-check (AppKit reconnects asynchronously)
    this.syncAccount(getAccount(wagmiConfig));
    setTimeout(() => {
      this.ngZone.run(() => {
        this.syncAccount(getAccount(wagmiConfig));
      });
    }, 500);
  }

  private syncAccount(account: { address?: string; chainId?: number; isConnected: boolean }) {
    this.address.set(account.address || null);
    this.chainId.set(account.chainId || null);
    this.isConnected.set(account.isConnected);
  }

  async connectWallet() {
    try {
      await this.modal.open();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      const { disconnect } = await import('@wagmi/core');
      const connectors = getAccount(wagmiConfig).connector;
      if (connectors) {
        await disconnect(wagmiConfig, { connector: connectors });
      }
      this.address.set(null);
      this.chainId.set(null);
      this.isConnected.set(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
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
      if (typeof window !== 'undefined') window.crypto.getRandomValues(nonceBytes);
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
        message: message as any,
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
