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
  // Defaulting to typical NestJS local port for now
  private apiUrl = 'http://localhost:3000/api/analyze'; 

  async analyzeAudio(fileOrUrl: File | string, paymentProof?: any): Promise<any> {
    let headers = new HttpHeaders();
    if (paymentProof) {
      // Wrap in JSON structure to satisfy backend and CDP schema exactly.
      const proofPayload = JSON.stringify({
        x402Version: 1,
        scheme: 'exact',
        network: 'base',
        payload: paymentProof
      });
      headers = headers.set('X-Payment-Proof', proofPayload);
    }

    const formData = new FormData();
    if (fileOrUrl instanceof File) {
      formData.append('file', fileOrUrl);
    } else {
      formData.append('url', fileOrUrl);
    }

    try {
      const response = await firstValueFrom(
        this.http.post(this.apiUrl, formData, { headers })
      );
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 402) {
        const req = error.error?.paymentRequirements || error.error;
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
