import { Component, ElementRef, inject, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '../services/web3.service';
import { ApiService, PaymentInvoice, PaymentRequiredError, ArtistStatsResponse } from '../services/api.service';
import { I18nService } from '../services/i18n.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { MetadataResultComponent } from '../metadata-result/metadata-result.component';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, MetadataResultComponent, TranslatePipe],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.css'
})
export class PlaygroundComponent {
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);
  i18n = inject(I18nService);

  fileUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  inputUrl = signal<string | null>(null);
  artistName = signal<string>('');
  artistStats = signal<ArtistStatsResponse | null>(null);

  /** Computed track title for display and matrix */
  trackTitle = computed(() => {
    const file = this.selectedFile();
    if (file) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (nameWithoutExt.includes(' - ') || nameWithoutExt.includes(' – ')) {
        const parts = nameWithoutExt.split(/ - | – /);
        return parts.slice(1).join(' - ').trim() || nameWithoutExt;
      }
      return nameWithoutExt;
    }
    const url = this.inputUrl();
    if (url) {
      try {
        const urlObj = new URL(url);
        const segment = urlObj.pathname.split('/').pop();
        if (segment) {
          return decodeURIComponent(segment).replace(/\.[^/.]+$/, '');
        }
      } catch {
        // keep fallback
      }
      return url;
    }
    return 'Demo Track';
  });

  private readonly FORBIDDEN_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'soundcloud.com'];
  private readonly ALLOWED_EXTS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];

  isAnalyzing = signal<boolean>(false);
  loadingStep = signal<string | null>(null);
  extractLyrics = signal<boolean>(false);

  paymentRequired = signal<boolean>(false);
  invoiceDetails = signal<PaymentInvoice | null>(null);

  /** Dynamic button label based on state and current language */
  buttonLabel = computed(() => {
    // Read currentLang signal to ensure reactivity on language change
    this.i18n.currentLang();

    if (this.isAnalyzing()) {
      return this.loadingStep() || this.i18n.t('playground.btnWorking');
    }
    if (this.paymentRequired()) {
      return this.i18n.t('playground.btnSignAndAnalyze');
    }
    return this.i18n.t('playground.btnAnalyze');
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

      // Auto-extract artist name from filename if formatted like "Artist - Title.ext"
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (nameWithoutExt.includes(' - ') || nameWithoutExt.includes(' – ')) {
        const parts = nameWithoutExt.split(/ - | – /);
        if (parts.length > 1 && parts[0].trim() && !this.artistName()) {
          this.artistName.set(parts[0].trim());
        }
      }

      this.resetResults();
    } else {
      this.errorMessage.set(this.i18n.t('playground.errors.invalidFile'));
    }
  }

  onArtistInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.artistName.set(val);
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
        return this.i18n.t('playground.errors.unsupportedDomain', { domain: urlObj.hostname });
      }

      // 4. Extension check (heuristic)
      const ext = urlObj.pathname.split('.').pop()?.toLowerCase();
      if (ext && !this.ALLOWED_EXTS.includes(`.${ext}`) && !url.includes('blob:')) {
        const forbiddenExts = ['html', 'htm', 'js', 'css'];
        if (forbiddenExts.includes(ext)) {
          return this.i18n.t('playground.errors.webpageNotAudio');
        }
      }

      return null;
    } catch (e) {
      return this.i18n.t('playground.errors.invalidUrl');
    }
  }

  removeFile() {
    this.selectedFile.set(null);
    this.fileUrl.set(null);
    this.resetResults();
  }

  onUrlInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.inputUrl.set(val);
      this.selectedFile.set(null); // Clear file if a URL is entered
      this.fileUrl.set(null);
      this.resetResults();
    }
  }

  /** Clears results and payment state only (keeps the current file/URL input). */
  resetResults() {
    this.paymentRequired.set(false);
    this.invoiceDetails.set(null);
    this.metadataResult.set(null);
    this.errorMessage.set(null);
    this.settlementTx.set(null);
    this.artistStats.set(null);
  }

  /** Full reset: clears everything including file/URL inputs. Used by "Analyze another track". */
  resetState() {
    this.selectedFile.set(null);
    this.fileUrl.set(null);
    this.inputUrl.set(null);
    this.artistName.set('');
    this.resetResults();
  }

  async connectWallet() {
    try {
      await this.web3Service.connectWallet();
    } catch (e) {
      this.errorMessage.set(this.i18n.t('playground.errors.couldNotConnect'));
    }
  }

  async disconnectWallet() {
    await this.web3Service.disconnectWallet();
  }

  async runAnalysis(paymentProof?: any) {
    const file = this.selectedFile();
    const url = this.inputUrl();

    if (!file && !url) {
      this.errorMessage.set(this.i18n.t('playground.errors.selectFileOrUrl'));
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
      this.loadingStep.set(this.i18n.t('playground.steps.paymentVerified'));
    } else {
      this.loadingStep.set(this.i18n.t('playground.steps.fetching'));
    }

    try {
      const network = this.invoiceDetails()?.network || 'base';

      // If an artist name is provided, query Spotify streaming metrics concurrently
      const trimmedArtist = this.artistName().trim();
      const artistPromise = trimmedArtist
        ? this.apiService.getArtistStats(trimmedArtist).catch((err) => {
            console.warn('Artist stats fetch skipped or failed gracefully:', err);
            return null;
          })
        : Promise.resolve(null);

      // Execute audio analysis and artist stats lookup in parallel
      const [result, fetchedArtistStats] = await Promise.all([
        this.apiService.analyzeAudio(file || url!, paymentProof, network, this.extractLyrics()),
        artistPromise,
      ]);

      if (fetchedArtistStats) {
        this.artistStats.set(fetchedArtistStats);
      }

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
        const specificError = err?.error?.message || err?.message || this.i18n.t('playground.errors.genericAnalysisError');
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

    this.loadingStep.set(this.i18n.t('playground.steps.awaitingSignature'));

    try {
      const paymentProof = await this.web3Service.signX402Payment(this.invoiceDetails()!.amount, this.invoiceDetails()!.destination_address);
      // Once signature generated, re-run analysis with payment proof
      await this.runAnalysis(paymentProof);
    } catch (err) {
      console.error(err);
      this.errorMessage.set(this.i18n.t('playground.errors.paymentFailed'));
      this.isAnalyzing.set(false);
    }
  }
}
