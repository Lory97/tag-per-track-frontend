import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '../services/web3.service';
import { ApiService, PaymentInvoice, PaymentRequiredError } from '../services/api.service';
import { MetadataResultComponent } from '../metadata-result/metadata-result.component';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, MetadataResultComponent],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.css'
})
export class PlaygroundComponent {
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);

  fileUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  inputUrl = signal<string | null>(null); // New signal for remote URL
  
  isAnalyzing = signal<boolean>(false);
  paymentRequired = signal<boolean>(false);
  invoiceDetails = signal<PaymentInvoice | null>(null);
  metadataResult = signal<any | null>(null);
  errorMessage = signal<string | null>(null);

  /** On-chain settlement transaction hash (from CDP facilitator) */
  settlementTx = signal<string | null>(null);

  isDragging = signal<boolean>(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files?.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    if (file.type.startsWith('audio/')) {
      this.selectedFile.set(file);
      this.inputUrl.set(null); // Clear URL if a file is selected
      this.fileUrl.set(URL.createObjectURL(file));
      this.resetState();
    } else {
      this.errorMessage.set('Please select a valid audio file (e.g. mp3, wav).');
    }
  }

  onUrlInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.inputUrl.set(val);
      this.selectedFile.set(null); // Clear file if a URL is entered
      this.fileUrl.set(null);
      this.resetState();
    }
  }

  resetState() {
    this.paymentRequired.set(false);
    this.invoiceDetails.set(null);
    this.metadataResult.set(null);
    this.errorMessage.set(null);
    this.settlementTx.set(null);
  }

  async connectWallet() {
    try {
      await this.web3Service.connectWallet();
    } catch (e) {
      this.errorMessage.set('Could not connect wallet.');
    }
  }

  async runAnalysis(paymentProof?: any) {
    const file = this.selectedFile();
    const url = this.inputUrl();
    
    if (!file && !url) {
      this.errorMessage.set('Please select a file or enter an audio URL.');
      return;
    }

    this.isAnalyzing.set(true);
    this.errorMessage.set(null);

    try {
      const network = this.invoiceDetails()?.network || 'base';
      // Use either the file or the URL string
      const result = await this.apiService.analyzeAudio(file || url!, paymentProof, network);
      this.metadataResult.set(result?.data || result);
      this.paymentRequired.set(false);
      this.invoiceDetails.set(null);

      // Capture the on-chain settlement tx hash if present
      if (result?.settlement?.transaction) {
        this.settlementTx.set(result.settlement.transaction);
      }
    } catch (error) {
      if (error instanceof PaymentRequiredError) {
        this.paymentRequired.set(true);
        this.invoiceDetails.set(error.invoice);
        console.log(error.invoice);
      } else {
        this.errorMessage.set('Analysis failed. Please verify the URL and try again.');
        console.error(error);
      }
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  async payAndAnalyze() {
    const invoice = this.invoiceDetails();
    if (!invoice) return;

    try {
      this.isAnalyzing.set(true);
      const paymentProof = await this.web3Service.signX402Payment(invoice.amount, invoice.destination_address);
      // Once signature generated, re-run analysis with payment proof
      await this.runAnalysis(paymentProof);
    } catch (err) {
      console.error(err);
      this.errorMessage.set('Payment failed or was cancelled.');
      this.isAnalyzing.set(false);
    }
  }
}
