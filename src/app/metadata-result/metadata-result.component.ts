import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ArtistStatsResponse } from '../services/api.service';
import { I18nService } from '../services/i18n.service';
import { TranslatePipe } from '../pipes/translate.pipe';

export interface Prediction {
  label: string;
  confidence: number;
}

export interface ArEvaluation {
  hybridScore: number;
  acousticScore: number;
  tractionScore: number;
  tierKey: string;
  badgeKey: string;
  recommendation: string;
  isEmergingGem: boolean;
}

@Component({
  selector: 'app-metadata-result',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './metadata-result.component.html',
  styleUrl: './metadata-result.component.css'
})
export class MetadataResultComponent {
  apiService = inject(ApiService);
  i18n = inject(I18nService);

  @Input() set data(value: any) {
    if (value) {
      this.resultData.set(value);
    }
  }

  @Input() set artistStats(value: ArtistStatsResponse | null) {
    if (value) {
      this.artistData.set(value);
      this.artistSearchInput.set(value.name);
      this.activeTab.set('ar');
    }
  }

  @Input() trackName: string = 'Demo Track';

  @Input() set initialArtistName(name: string | null) {
    if (name && !this.artistSearchInput()) {
      this.artistSearchInput.set(name);
    }
  }

  resultData = signal<any>(null);
  artistData = signal<ArtistStatsResponse | null>(null);
  artistSearchInput = signal<string>('');
  isSearchingArtist = signal<boolean>(false);
  artistSearchError = signal<string | null>(null);
  activeTab = signal<'ar' | 'vibe' | 'lyrics'>('ar');

  get bpm(): number {
    return this.resultData()?.bpm || 0;
  }

  get key(): string {
    const data = this.resultData();
    if (!data || !data.key) return '--';
    const scaleKey = data.scale ? data.scale.toLowerCase() : '';
    const translatedScale = scaleKey ? (this.i18n.translate(`scales.${scaleKey}`) || data.scale) : '';
    return `${data.key} ${translatedScale}`.trim();
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

  get dominantMood(): Prediction | null {
    const m = this.moods;
    return m.length > 0 ? m[0] : null;
  }

  get lyrics(): string | null {
    return this.resultData()?.lyrics || null;
  }

  /**
   * Cleans Essentia raw labels (e.g., 'electronic---deep_house' -> 'Deep house')
   */
  formatLabel(raw: string): string {
    if (!raw || raw === 'error' || raw === 'unavailable') {
      return this.i18n.translate('result.unknown');
    }
    const parts = raw.split('---');
    const lastPart = parts[parts.length - 1];
    const cleaned = lastPart.replace(/_/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  /**
   * Formats large numbers into readable abbreviations (e.g., 29,284,872 -> '29.3M')
   */
  formatNumber(val: number | undefined): string {
    if (val === undefined || val === null) return '--';
    if (val >= 1_000_000) {
      return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (val >= 1_000) {
      return (val / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return val.toLocaleString();
  }

  /**
   * Computed A&R Hybrid scoring, classification, and strategic recommendation
   */
  arEvaluation = computed<ArEvaluation>(() => {
    // Read currentLang to ensure reactive recomputation on language switch
    const lang = this.i18n.currentLang();
    const artist = this.artistData();
    const data = this.resultData();

    // 1. Acoustic viability score (0 - 100)
    let acousticScore = 50;
    if (data) {
      const topGenreConf = this.genres.length > 0 ? this.genres[0].confidence : 0.5;
      const moodConf = this.dominantMood ? this.dominantMood.confidence : 0.5;
      const bpmFit = this.bpm >= 80 && this.bpm <= 150 ? 15 : 10;
      const harmonicFit = data.key ? 15 : 5;
      const lyricsBonus = this.lyrics ? 10 : 0;
      acousticScore = Math.min(
        98,
        Math.round(25 + topGenreConf * 25 + moodConf * 25 + bpmFit + harmonicFit + lyricsBonus)
      );
    }

    // 2. Traction score (0 - 100)
    let tractionScore = 0;
    let listeners = 0;
    let popularity = 0;

    if (artist && artist.spotify) {
      popularity = artist.spotify.popularity || 0;
      listeners = artist.spotify.monthlyListeners || artist.spotify.followers || 0;
      const listenerLogScore = listeners > 0 ? Math.min(100, Math.round(Math.log10(listeners) * 12.5)) : 0;
      tractionScore = Math.round(popularity * 0.65 + listenerLogScore * 0.35);
    }

    // 3. Hybrid score synthesis
    let hybridScore = acousticScore;
    let isEmergingGem = false;

    if (artist && artist.spotify) {
      hybridScore = Math.round(tractionScore * 0.55 + acousticScore * 0.45);
      // Emerging artist with exceptional acoustic score receives a Hidden Gem boost
      if (listeners < 50_000 && acousticScore >= 75) {
        isEmergingGem = true;
        hybridScore = Math.min(95, hybridScore + 12);
      }
    }

    // 4. Tier classification
    let tierKey = 'early';
    if (listeners >= 1_000_000 || popularity >= 70) {
      tierKey = 'established';
    } else if (listeners >= 50_000 || popularity >= 35) {
      tierKey = 'rising';
    } else if (listeners > 0 || isEmergingGem) {
      tierKey = 'emerging';
    }

    // 5. Badge classification
    let badgeKey = 'developing';
    if (hybridScore >= 80) {
      badgeKey = 'viral';
    } else if (hybridScore >= 65) {
      badgeKey = 'strong';
    } else if (hybridScore >= 45) {
      badgeKey = 'niche';
    }

    // 6. Strategic A&R recommendation synthesis
    let recommendation = '';
    const mainGenre = this.genres.length > 0 ? this.formatLabel(this.genres[0].label) : 'Électro / Pop';

    if (tierKey === 'established') {
      recommendation = lang === 'fr'
        ? `Artiste de premier plan bénéficiant d'une force de frappe établie (${this.formatNumber(listeners)} auditeurs). Prioriser la négociation de licence exclusive, le placement direct en têtes de playlists éditoriales majeures et les partenariats de synchronisation média.`
        : `Top-tier artist with massive existing distribution power (${this.formatNumber(listeners)} listeners). Prioritize master licensing, headline playlist placement, and premium synchronization partnerships.`;
    } else if (tierKey === 'rising') {
      recommendation = lang === 'fr'
        ? `Artiste en forte ascension avec traction streaming confirmée. Adéquation remarquable avec le style ${mainGenre}. Recommandé : signature en licence prioritaire, co-édition et campagne d'amplification sur les formats courts (Reels/TikTok).`
        : `High-velocity rising artist with verified streaming velocity. Exceptional alignment with ${mainGenre}. Recommended: priority licensing deal, co-publishing, and short-form video amplification.`;
    } else if (isEmergingGem || tierKey === 'emerging') {
      recommendation = lang === 'fr'
        ? `Pépite émergente à fort potentiel artistique (Talent Brut). Score acoustique élevé (${acousticScore}/100). Recommandé : signature en distribution exclusive ou contrat de développement 360°, ciblage playlists de découverte (Fresh Finds) et mise en avant de l'identité sonore.`
        : `Emerging hidden gem with standout artistic quality. High acoustic score (${acousticScore}/100). Recommended: early 360 development or exclusive distribution deal, targeted discovery playlist pitching (Fresh Finds), and sonic brand building.`;
    } else {
      recommendation = lang === 'fr'
        ? `Profil en phase de développement initial. Recommandé : affiner les arrangements acoustiques, tester des versions club/acoustiques et consolider la fanbase organique avant démarchage des majors.`
        : `Early development stage profile. Recommended: refine acoustic arrangements, test alternate radio/club mixes, and foster organic fanbase engagement before major label pitching.`;
    }

    return {
      hybridScore,
      acousticScore,
      tractionScore,
      tierKey,
      badgeKey,
      recommendation,
      isEmergingGem,
    };
  });

  onSearchInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.artistSearchInput.set(val);
  }

  async searchArtist(customName?: string) {
    const query = (customName !== undefined ? customName : this.artistSearchInput()).trim();
    if (!query) return;

    this.isSearchingArtist.set(true);
    this.artistSearchError.set(null);

    try {
      const stats = await this.apiService.getArtistStats(query);
      this.artistData.set(stats);
      this.artistSearchInput.set(stats.name);
    } catch (e: any) {
      console.warn('Artist search failed:', e);
      this.artistSearchError.set(this.i18n.translate('result.artistNotFound') || 'Artist not found on Spotify');
    } finally {
      this.isSearchingArtist.set(false);
    }
  }

  copyLyrics() {
    const l = this.lyrics;
    if (l) {
      navigator.clipboard.writeText(l);
    }
  }
}