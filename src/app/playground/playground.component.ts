import { Component, ElementRef, inject, signal, ViewChild, computed } from '@angular/core';
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
  inputUrl = signal<string | null>(null);

  private readonly FORBIDDEN_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'soundcloud.com'];
  private readonly ALLOWED_EXTS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];

  isAnalyzing = signal<boolean>(false);
  loadingStep = signal<string | null>(null); // New signal for UX feedback

  paymentRequired = signal<boolean>(false);
  invoiceDetails = signal<PaymentInvoice | null>(null);

  /** Dynamic button label based on state */
  buttonLabel = computed(() => {
    if (this.isAnalyzing()) {
      return this.loadingStep() || 'Working...';
    }
    if (this.paymentRequired()) {
      return 'Sign & Analyze';
    }
    return 'Analyze Track';
  });
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
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ext ? this.ALLOWED_EXTS.includes(`.${ext}`) : false;

    if (file.type.startsWith('audio/') || isAllowedExt) {
      this.selectedFile.set(file);
      this.inputUrl.set(null); // Clear URL if a file is selected
      this.fileUrl.set(URL.createObjectURL(file));
      this.resetState();
    } else {
      this.errorMessage.set('Please select a valid audio file (mp3, wav, ogg, etc.).');
    }
  }

  private validateUrl(url: string): string | null {
    try {
      // 1. IPFS rule
      if (url.startsWith('ipfs://')) {
        return null; // IPFS protocol is handled by backend
      }

      const urlObj = new URL(url);
      
      // 2. Google Drive rule
      if (urlObj.hostname.includes('drive.google.com')) {
        return null; // Drive links are parsed by backend
      }

      // 3. Check for forbidden video domains
      if (this.FORBIDDEN_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
        return `Direct analysis of ${urlObj.hostname} is not supported. Please provide a direct link to a raw audio file.`;
      }

      // 2. Extension check (heuristic)
      const ext = urlObj.pathname.split('.').pop()?.toLowerCase();
      if (ext && !this.ALLOWED_EXTS.includes(`.${ext}`) && !url.includes('blob:')) {
        // We allow it as sometimes URLs don't have extensions, but we can warn or prefer direct hits
        // For now, we block if it's a strongly typed web extension like .html, .js, .css
        const forbiddenExts = ['html', 'htm', 'js', 'css'];
        if (forbiddenExts.includes(ext)) {
          return 'The link seems to point to a webpage, not an audio file.';
        }
      }

      return null;
    } catch (e) {
      return 'Please enter a valid URL (including http:// or https://).';
    }
  }

  removeFile() {
    this.selectedFile.set(null);
    this.fileUrl.set(null);
    this.resetState();
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

    if (url && !file) {
      const urlValidationError = this.validateUrl(url);
      if (urlValidationError) {
        this.errorMessage.set(urlValidationError);
        return;
      }
    }

    this.isAnalyzing.set(true);
    this.errorMessage.set(null);

    if (paymentProof) {
      this.loadingStep.set('🧠 Payment verified! Neural listening and analysis in progress...');
    } else {
      this.loadingStep.set('📡 Fetching audio track...');
    }

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
        // Extract specific message from backend (NestJS standard error format)
        const err = error as any;
        const specificError = err?.error?.message || err?.message || 'Analysis failed. Please verify the URL and try again.';
        this.errorMessage.set(specificError);
        console.error('Backend analysis error:', error);
      }
    } finally {
      this.isAnalyzing.set(false);
      this.loadingStep.set(null);
    }
  }

  async payAndAnalyze() {
    if (!this.invoiceDetails()) return;

    this.loadingStep.set('✍️ Awaiting your Web3 signature (Gasless)...');

    try {
      const paymentProof = await this.web3Service.signX402Payment(this.invoiceDetails()!.amount, this.invoiceDetails()!.destination_address);
      // Once signature generated, re-run analysis with payment proof
      await this.runAnalysis(paymentProof);
    } catch (err) {
      console.error(err);
      this.errorMessage.set('Payment failed or was cancelled.');
      this.isAnalyzing.set(false);
    }
  }
}
