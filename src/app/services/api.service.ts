import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatUnits } from 'viem';

export interface PaymentInvoice {
  amount: string;
  currency: string;
  network: string;
  destination_address: string;
}

export interface SpotifyArtistMetrics {
  id: string;
  followers: number;
  popularity: number;
  monthlyListeners?: number;
  genres: string[];
  url: string;
}

export interface ArtistStatsResponse {
  name: string;
  spotify: SpotifyArtistMetrics;
  cached: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  data: any;
  message: string;
  settlement?: {
    success: boolean;
    transaction: string;
    network: string;
    payer: string;
  };
}

export class PaymentRequiredError extends Error {
  constructor(public invoice: PaymentInvoice) {
    super('Payment Required');
    this.name = 'PaymentRequiredError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = isDevMode()
    ? 'http://localhost:3000/api'
    : 'https://api.tag-per-track.cloud/api';
  private apiUrl = `${this.baseUrl}/analyze`;
  /** The full PaymentRequired v2 response from the 402 */
  private lastPaymentRequired: any = null;
  /** The selected PaymentRequirements from accepts[0] */
  private lastAccepted: any = null;

  async getArtistStats(artistName: string): Promise<ArtistStatsResponse> {
    const trimmed = artistName.trim();
    if (!trimmed) {
      throw new Error('Artist name cannot be empty');
    }
    const url = `${this.baseUrl}/artist-stats?name=${encodeURIComponent(trimmed)}`;
    return firstValueFrom(this.http.get<ArtistStatsResponse>(url));
  }

  async analyzeAudio(fileOrUrl: File | string, paymentProof?: any, network: string = 'base', extractLyrics: boolean = false): Promise<AnalysisResponse> {
    const targetUrl = extractLyrics ? `${this.apiUrl}-with-lyrics` : this.apiUrl;
    
    let headers = new HttpHeaders();
    if (paymentProof) {
      // Build x402 v2 PaymentPayload per official SDK schema:
      // https://github.com/coinbase/x402/blob/main/typescript/packages/core/src/types/payments.ts
      const proofPayload = JSON.stringify({
        x402Version: 2,
        accepted: this.lastAccepted,
        payload: {
          signature: paymentProof.signature,
          authorization: paymentProof.authorization,
        },
        resource: this.lastPaymentRequired?.resource || {
          url: targetUrl,
          description: extractLyrics
            ? 'Tag-per-Track: Agentic-First Musical Audio Analysis API. Extracts BPM, Key, Mood, Genres, Instruments, AND Lyrics from audio URLs.'
            : 'Tag-per-Track: Agentic-First Musical Audio Analysis API. Extracts BPM, Key, Mood, Genres and Instruments from audio URLs.',
          mimeType: 'application/json',
        },
        extensions: this.lastPaymentRequired?.extensions,
      });
      headers = headers.set('X-Payment-Proof', proofPayload);
    }

    const formData = new FormData();
    if (fileOrUrl instanceof File) {
      formData.append('file', fileOrUrl);
    } else {
      formData.append('fileUrl', fileOrUrl);
    }

    try {
      const response = await firstValueFrom(
        this.http.post(targetUrl, formData, {
          headers,
          observe: 'response', // Get full response to read headers
        })
      );

      // Extract settlement info from X-Payment-Response header
      const paymentResponse = response.headers.get('X-Payment-Response');
      let settlement;
      if (paymentResponse) {
        try {
          settlement = JSON.parse(paymentResponse);
        } catch (e) {
          console.warn('Could not parse X-Payment-Response header:', e);
        }
      }

      const body = response.body as any;
      return {
        ...body,
        settlement,
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 402) {
        // Parse the v2 PaymentRequired response
        const paymentRequired = error.error?.paymentRequirements || error.error;
        // Store full response and the first accepted option
        this.lastPaymentRequired = paymentRequired;
        this.lastAccepted = paymentRequired.accepts?.[0] || paymentRequired;
        // Read amount from the accepted option (v2: amount, v1 fallback: maxAmountRequired)
        const rawAmount = this.lastAccepted.amount || this.lastAccepted.maxAmountRequired;

        const invoice: PaymentInvoice = {
          // Format from smallest unit (wei) to decimal (Assuming 6 decimals for USDC)
          amount: rawAmount ? formatUnits(BigInt(rawAmount), 6) : '0',
          currency: this.lastAccepted.asset || this.lastAccepted.currency,
          network: this.lastAccepted.network,
          destination_address: this.lastAccepted.payTo || this.lastAccepted.destination_address,
        };
        throw new PaymentRequiredError(invoice);
      }
      throw error;
    }
  }
}
