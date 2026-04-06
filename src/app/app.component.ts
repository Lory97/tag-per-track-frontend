import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundComponent } from './playground/playground.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlaygroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Tag-per-Track Frontend';
}
