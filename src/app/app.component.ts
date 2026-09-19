import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { PlaygroundComponent } from './playground/playground.component';
import { I18nService } from './services/i18n.service';
import { TranslatePipe } from './pipes/translate.pipe';
import { BrandLogoComponent } from './brand-logo/brand-logo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlaygroundComponent, TranslatePipe, BrandLogoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  i18n = inject(I18nService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  title = 'Tag-per-Track | Autonomous A&R Engine & Audio MCP Server';
  copied = signal(false);

  ngOnInit() {
    this.titleService.setTitle('Tag-per-Track | Autonomous A&R Engine & Audio MCP Server');
    this.metaService.updateTag({
      name: 'description',
      content: 'Autonomous music intelligence for record labels & AI agents. Instant acoustic metadata analysis, Spotify traction scoring and automated demo qualification via MCP & API.'
    });
    this.metaService.updateTag({ property: 'og:title', content: 'Tag-per-Track | Autonomous A&R Engine & Audio MCP Server' });
    this.metaService.updateTag({ property: 'og:description', content: 'Autonomous music intelligence for record labels & AI agents. Instant acoustic metadata analysis, Spotify traction scoring and automated demo qualification via MCP & API.' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://tag-per-track.cloud/og-image.png' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://tag-per-track.cloud' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'Tag-per-Track | Autonomous A&R Engine & Audio MCP Server' });
    this.metaService.updateTag({ name: 'twitter:description', content: 'Autonomous music intelligence for record labels & AI agents. Instant acoustic metadata analysis, Spotify traction scoring and automated demo qualification via MCP & API.' });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://tag-per-track.cloud/og-image.png' });
  }

  mcpConfig = {
    "mcpServers": {
      "tag-per-track": {
        "command": "npx",
        "args": [
          "-y",
          "tag-per-track-mcp@latest"
        ],
        "env": {
          "PRIVATE_KEY": "0xYOUR_BURNER_WALLET_PRIVATE_KEY_HERE",
          "MAX_SPENDING_USDC": "0.20"
        }
      }
    }
  };

  copyMcpConfig() {
    navigator.clipboard.writeText(JSON.stringify(this.mcpConfig, null, 2));
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
