import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MetadataResultComponent } from './metadata-result.component';
import { ApiService } from '../services/api.service';
import { I18nService } from '../services/i18n.service';

describe('MetadataResultComponent', () => {
  let component: MetadataResultComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetadataResultComponent, HttpClientTestingModule],
      providers: [ApiService, I18nService]
    }).compileComponents();

    const fixture = TestBed.createComponent(MetadataResultComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute hybrid A&R score combining acoustic data and artist stats', () => {
    component.data = {
      bpm: 124,
      key: 'A',
      scale: 'minor',
      genres: [{ label: 'electronic---house', confidence: 0.9 }],
      moods: [{ label: 'party', confidence: 0.85 }],
      instruments: [{ label: 'synthesizer', confidence: 0.95 }]
    };

    component.artistStats = {
      name: 'Daft Punk',
      spotify: {
        id: '4tZwfgrHOc3mvqYlEYSvVi',
        followers: 11769126,
        popularity: 84,
        monthlyListeners: 29284872,
        genres: ['filter house', 'electro'],
        url: 'https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi'
      },
      cached: false
    };

    const evalResult = component.arEvaluation();
    expect(evalResult.hybridScore).toBeGreaterThanOrEqual(70);
    expect(evalResult.tierKey).toBe('established');
    expect(evalResult.badgeKey).toBe('viral');
    expect(evalResult.recommendation).toBeTruthy();
  });

  it('should detect emerging gem when listener count is low but acoustic score is high', () => {
    component.data = {
      bpm: 122,
      key: 'F#',
      scale: 'minor',
      genres: [{ label: 'indie---chillwave', confidence: 0.95 }],
      moods: [{ label: 'relaxed', confidence: 0.9 }],
      instruments: [{ label: 'guitar', confidence: 0.8 }]
    };

    component.artistStats = {
      name: 'New Underground Act',
      spotify: {
        id: 'new_act_123',
        followers: 1200,
        popularity: 25,
        monthlyListeners: 8400,
        genres: ['chillwave'],
        url: 'https://open.spotify.com/artist/new_act_123'
      },
      cached: true
    };

    const evalResult = component.arEvaluation();
    expect(evalResult.isEmergingGem).toBeTrue();
    expect(evalResult.tierKey).toBe('emerging');
  });

  it('should format large numbers correctly', () => {
    expect(component.formatNumber(29284872)).toBe('29.3M');
    expect(component.formatNumber(450000)).toBe('450K');
    expect(component.formatNumber(850)).toBe('850');
  });
});
