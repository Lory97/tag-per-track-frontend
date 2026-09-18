import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BrandLogoVariant = 'two-tone' | 'monochrome' | 'pure-amber';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.width]="formattedSize()"
      [attr.height]="formattedSize()"
      role="img"
      aria-label="Tag-per-Track Studio Logo"
      class="overflow-visible block select-none"
    >
      @if (withBackground()) {
        <!-- Studio Matte Chassis Plate -->
        <rect width="48" height="48" rx="10" fill="#121214" />
      }

      @if (withEyelet()) {
        <!-- Optional Refined Hang Ring (Clean 45° Arc) -->
        <path
          d="M 16.5 13.5 C 14 6.5 6 8.5 5 15 C 4 21.5 12 22.5 15.5 18"
          [attr.stroke]="accentStroke()"
          [attr.stroke-width]="strokeWidth() * 0.9"
        />
        <!-- Precision Grommet Eyelet -->
        <circle
          cx="17"
          cy="16"
          r="2.4"
          fill="#121214"
          [attr.stroke]="accentStroke()"
          [attr.stroke-width]="strokeWidth() * 0.85"
        />
      }

      <!-- Hexagonal Cartridge Badge Body with Silkscreen Notches at Y=24 -->
      <!-- Top Half -->
      <path
        d="M 9 20 L 9 14.6 L 24 6 L 39 14.6 L 39 20"
        [attr.stroke]="badgeStroke()"
        [attr.stroke-width]="strokeWidth()"
      />
      <!-- Bottom Half -->
      <path
        d="M 39 28 L 39 33.4 L 24 42 L 9 33.4 L 9 28"
        [attr.stroke]="badgeStroke()"
        [attr.stroke-width]="strokeWidth()"
      />

      <!-- Analog Oscilloscope Audio Waveform (Through-Track Oscillation) -->
      <path
        d="M 3 24 L 10.5 24 C 12 24 13 27.5 14.5 27.5 C 16 27.5 17 19.5 18.5 19.5 C 20 19.5 21 32 22.8 32 C 24.5 32 25.5 10 27 10 C 28.5 10 29.5 37 31.2 37 C 32.7 37 33.5 18 35 18 C 36.2 18 37 24 38.5 24 L 45 24"
        [attr.stroke]="accentStroke()"
        [attr.stroke-width]="strokeWidth() * 1.05"
      />
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }
  `]
})
export class BrandLogoComponent {
  /** Size in pixels (e.g. 24, 32, 48) or CSS dimensions (e.g. '100%') */
  size = input<number | string>('100%');

  /**
   * Visual aesthetic variant:
   * - 'two-tone': Technical off-white (#EDEDED) chassis frame with studio amber (#FF6B35) audio waveform
   * - 'monochrome': Inherits currentColor across all vectors (great for Tailwind text-* classes)
   * - 'pure-amber': Fully rendered in studio VU-meter amber (#FF6B35)
   */
  variant = input<BrandLogoVariant>('two-tone');

  /** Base stroke width calibrated on 48x48 viewport (default 2.4 produces crisp 1px lines at 20px, 1.6px at 32px) */
  strokeWidth = input<number>(2.4);

  /** Whether to render the matte dark rounded chassis plate behind the logo */
  withBackground = input<boolean>(false);

  /** Whether to display the decorative eyelet & ring (defaults to false for pure, balanced symmetry) */
  withEyelet = input<boolean>(false);

  /** Custom badge stroke color override */
  customBadgeColor = input<string | null>(null);

  /** Custom accent stroke color override */
  customAccentColor = input<string | null>(null);

  formattedSize = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? `${s}px` : s;
  });

  badgeStroke = computed(() => {
    if (this.customBadgeColor()) return this.customBadgeColor()!;
    if (this.variant() === 'monochrome') return 'currentColor';
    if (this.variant() === 'pure-amber') return '#FF6B35';
    return '#EDEDED';
  });

  accentStroke = computed(() => {
    if (this.customAccentColor()) return this.customAccentColor()!;
    if (this.variant() === 'monochrome') return 'currentColor';
    return '#FF6B35';
  });
}
