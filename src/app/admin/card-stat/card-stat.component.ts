import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-stat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="cardClass">
      <div class="stat-icon">
        <i [class]="icon"></i>
      </div>
      <div class="stat-content">
        <h3>{{title}}</h3>
        <p class="stat-value">{{value}}</p>
        <p class="stat-label" *ngIf="label">{{label}}</p>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }

    .stat-card.orange .stat-icon {
      background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
      color: white;
    }

    .stat-card.green .stat-icon {
      background: linear-gradient(135deg, #68d391 0%, #48bb78 100%);
      color: white;
    }

    .stat-card.blue .stat-icon {
      background: linear-gradient(135deg, #63b3ed 0%, #4299e1 100%);
      color: white;
    }

    .stat-card.red .stat-icon {
      background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #718096;
      font-weight: 500;
    }

    .stat-value {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #2d3748;
      line-height: 1;
    }

    .stat-label {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #a0aec0;
    }
  `]
})
export class CardStatComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() label: string = '';
  @Input() icon: string = 'fas fa-chart-line';
  @Input() cardClass: string = 'blue';
}