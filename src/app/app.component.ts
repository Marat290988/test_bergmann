import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ChartType } from './chart/app-chart.component';
import { Subject, Subscription } from 'rxjs';
import { PanelComponent } from './panel/app-panel.component';



export type SensorDataType = {
  name: string
  type: 'temperature' | 'humidity' | 'light',
  data: {name: string, y: number}[]
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'test_bergmann';
  sensorData: SensorDataType[] = [
    {
      name: 'Temperature1',
      type: 'temperature',
      data: this.generateCalendarData()
    },
    {
      name: 'Temperature2',
      type: 'temperature',
      data: this.generateCalendarData()
    },
    {
      name: 'Temperature3',
      type: 'temperature',
      data: this.generateCalendarData()
    },
    {
      name: 'Humidity1',
      type: 'humidity',
      data: this.generateCalendarData()
    },
    {
      name: 'Humidity2',
      type: 'humidity',
      data: this.generateCalendarData()
    },
    {
      name: 'Humidity3',
      type: 'humidity',
      data: this.generateCalendarData()
    },
    {
      name: 'Light1',
      type: 'light',
      data: this.generateCalendarData()
    },
    {
      name: 'Light2',
      type: 'light',
      data: this.generateCalendarData()
    },
    {
      name: 'Light3',
      type: 'light',
      data: this.generateCalendarData()
    }
  ]
  chartData: ChartType[] = [{chartName: 'Add new'}];
  chartDataChange$ = new Subject<ChartType>();
  subs: Subscription[] = [];
  @ViewChild(PanelComponent) panel!: PanelComponent;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  private generateCalendarData(): {name: string, y: number}[] {
    const dateStart = new Date('01.01.2023');
    const calendarData: {name: string, y: number}[] = [];
    calendarData.push({name: moment(new Date('01.01.2023')).format('DD.MM.YYYY'), y: getRandomNumber(0, 100)});
    let nextDay = this.getNextDay(dateStart);
    while (moment(nextDay).format('DD.MM.YYYY') !== '01.01.2024') {
      calendarData.push({name: moment(nextDay).format('DD.MM.YYYY'), y: getRandomNumber(0, 100)});
      nextDay = this.getNextDay(nextDay);
    }
    return calendarData;
  }

  private getNextDay(date: Date): Date {
    const mls = date.getTime() + (24 * 60 * 60 * 1000);
    return new Date(mls);
  }

  onRemoveChart(item: ChartType) {
    const deleteIndex = this.chartData.findIndex(ch => ch.chartName === item.chartName);
    this.chartData.splice(deleteIndex, 1);
    this.panel.returnAddNew();
  }

}
