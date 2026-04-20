import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatUnits } from 'viem';

export interface PaymentInvoice {
  amount: string;
  currency: string;
  network: string;
  destination_address: string;
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
  private apiUrl = 'https://api.tag-per-track.cloud/api/analyze';
  private lastInvoiceRequirements: any = null;

  async analyzeAudio(fileOrUrl: File | string, paymentProof?: any, network: string = 'base'): Promise<AnalysisResponse> {
    let headers = new HttpHeaders();
    if (paymentProof) {
      // Build x402 v2 paymentPayload per CDP schema:
      // https://docs.cdp.coinbase.com/api-reference/v2/rest-api/x402-facilitator/verify-a-payment
      const invoice = this.lastInvoiceRequirements;
      const proofPayload = JSON.stringify({
        x402Version: 2,
        accepted: {
          scheme: 'exact',
          network: invoice?.network || network,
          asset: invoice?.asset || invoice?.currency || '',
          amount: invoice?.maxAmountRequired || '',
          payTo: invoice?.payTo || invoice?.destination_address || '',
          maxTimeoutSeconds: invoice?.maxTimeoutSeconds || 600,
          extra: invoice?.extra || { name: 'USDC', version: '2' },
        },
        payload: {
          signature: paymentProof.signature,
          authorization: paymentProof.authorization,
        },
        resource: {
          url: this.apiUrl,
          description: 'Audio Analysis Micro-payment',
          mimeType: 'application/json',
        },
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
        this.http.post(this.apiUrl, formData, {
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
        const req = error.error?.paymentRequirements || error.error;
        // Store the raw requirements for building the v2 payload later
        this.lastInvoiceRequirements = req;
        const rawAmount = req.maxAmountRequired || req.amount;

        const invoice: PaymentInvoice = {
          // Format from smallest unit (wei) to decimal (Assuming 6 decimals for USDC)
          amount: rawAmount ? formatUnits(BigInt(rawAmount), 6) : '0',
          currency: req.asset || req.currency,
          network: req.network,
          destination_address: req.payTo || req.destination_address
        };
        throw new PaymentRequiredError(invoice);
      }
      throw error;
    }
  }
}
