import { Input, OnInit, AfterViewInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { SensorDataType } from '../app.component';

export type ChartType = {
  chartName: string,
  startDate?: string,
  endDate?: string,
  chartType?: 'Line' | 'Bar Chart',
  line?: {
    color: 'string',
    sensor: 'string'
  }[]
}

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);

@Component({
  selector: 'app-chart',
  templateUrl: './app-chart.component.html',
  styleUrls: ['./app-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() chartItem!: ChartType;
  @Input() chartDataChange$!: Subject<ChartType>;
  @Input() sensorData!: SensorDataType[];
  @Output() removeChart = new EventEmitter();

  renderData: {name: string, y: number}[][] = [];
  subs!: Subscription;

  ngOnInit(): void {
    this.prepareRenderData();
    this.subs = this.chartDataChange$.subscribe(ch => {
      if (ch.chartName === this.chartItem.chartName) {
        this.prepareRenderData();
        this.createChartColumn();
      }
    })
  }

  ngAfterViewInit(): void {
    if (this.chartItem.chartType === 'Bar Chart') {
      this.createChartColumn();
    } else {
      this.createChartLine();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  prepareRenderData() {
    this.chartItem.line?.forEach((ch, i) => {
      const findIndex = this.sensorData.findIndex(s => s.name === ch.sensor);
      if (findIndex > -1) {
        const startIndex = this.sensorData[findIndex].data.findIndex(d => d.name === this.chartItem.startDate);
        const end = this.sensorData[findIndex].data.findIndex(d => d.name === this.chartItem.endDate) + 1;
        this.renderData[i] = this.sensorData[findIndex].data.slice(startIndex, end);
      }
    })
  }

  private createChartColumn(): void {

    const chart = Highcharts.chart(
      this.chartItem.chartName as any,
      {
        chart: {
          type: 'column',
        },
        accessibility: {
          enabled: false
        },
        title: {
          text: this.chartItem.chartName,
        },
        credits: {
          enabled: false,
        },
        legend: {
          enabled: false,
        },
        yAxis: {
          min: 0,
          title: undefined,
        },
        xAxis: {
          type: 'category',
        },
        tooltip: {
          headerFormat: `<div>Date: {point.key}</div>`,
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
            },
          },
        },
        series: this.getSeries()
      } as any
    );

  }

  private createChartLine(): void {

    const chart = Highcharts.chart(this.chartItem.chartName, {
      chart: {
        type: 'line',
      },
      accessibility: {
        enabled: false
      },
      title: {
        text: this.chartItem.chartName,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: this.getSeries(),
    } as any);
  }

  remove() {
    this.removeChart.emit(this.chartItem);
  }

  getSeries() {
    const seriesArr: any[] = [];
    this.chartItem.line?.forEach((ch, i) => {
      seriesArr.push({
        id: ch.sensor,
        name: 'Amount',
        data: this.renderData[i],
        color: ch.color
      })
    })
    return seriesArr;
  }

}
