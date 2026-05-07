import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Prediction {
  label: string;
  confidence: number;
}

@Component({
  selector: 'app-metadata-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metadata-result.component.html',
  styleUrl: './metadata-result.component.css'
})
export class MetadataResultComponent {
  @Input() set data(value: any) {
    if (value) {
      this.resultData.set(value);
    }
  }

  resultData = signal<any>(null);

  get bpm(): number {
    return this.resultData()?.bpm || 0;
  }

  // Combine la clé et la gamme (ex: "A" + "minor" = "A minor")
  get key(): string {
    const data = this.resultData();
    if (!data || !data.key) return '--';
    return `${data.key} ${data.scale || ''}`.trim();
  }

  get genres(): Prediction[] {
    return this.resultData()?.genres || [];
  }

  get instruments(): Prediction[] {
    return this.resultData()?.instruments || [];
  }

  get moods(): Prediction[] {
    return this.resultData()?.moods || [];
  }

  // Isole la première humeur pour la mise en avant
  get dominantMood(): Prediction | null {
    const m = this.moods;
    return m.length > 0 ? m[0] : null;
  }

  /**
   * Nettoie les labels retournés par Essentia.
   * Ex: "electronic---deep_house" devient "Deep house"
   */
  formatLabel(raw: string): string {
    if (!raw || raw === 'error' || raw === 'unavailable') return 'Unknown';
    const parts = raw.split('---');
    const lastPart = parts[parts.length - 1];
    const cleaned = lastPart.replace(/_/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  activeTab = signal<'vibe' | 'lyrics'>('vibe');

  get lyrics(): string | null {
    return this.resultData()?.lyrics || null;
  }

  copyLyrics() {
    const l = this.lyrics;
    if (l) {
      navigator.clipboard.writeText(l);
      // Optional: you could add a toast or copied state here
    }
  }
}