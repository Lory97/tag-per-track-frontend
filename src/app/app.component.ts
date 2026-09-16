import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundComponent } from './playground/playground.component';
import { I18nService } from './services/i18n.service';
import { TranslatePipe } from './pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlaygroundComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  i18n = inject(I18nService);
  title = 'Tag-per-Track Frontend';
  copied = signal(false);

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
