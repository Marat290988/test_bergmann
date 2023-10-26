import { ChangeDetectionStrategy, Component, ChangeDetectorRef, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SensorDataType, getRandomNumber } from "../app.component";
import { ChartType } from "../chart/app-chart.component";
import { Subject } from "rxjs";
import * as moment from 'moment';

@Component({
  selector: 'app-panel',
  templateUrl: './app-panel.component.html',
  styleUrls: ['./app-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {

  formGroup!: FormGroup;
  min = new Date(2023, 0, 1);
  max = new Date(2023, 11, 31);
  typeChart: string[] = [
    'Line', 'Bar Chart'
  ];
  color: string[] = ['#FF00FF', '#800080', '#FF0000', '#800000', '#FFFF00', '#00FF00', '#008000', '#00FFFF', '#008080', '#0000FF', '#000080'];
  charts: {code: string, value: string}[] = [{code: 'Chart0', value: 'Add new'}];

  @Input() sensorData!: SensorDataType[];
  @Input() chartData: ChartType[] = [];
  @Input() chartDataChange$!: Subject<ChartType>;

  constructor(
    private changeDetection: ChangeDetectorRef
  ){}

  ngOnInit() {
    this.formGroup = new FormGroup({
      start: new FormControl<Date | null>(new Date(2023, 0, 1), [Validators.required]),
      end: new FormControl<Date | null>(new Date(2023, 11, 31), [Validators.required]),
      typeChart: new FormControl(this.typeChart[0], [Validators.required]),
      color: new FormControl(this.color[0], [Validators.required]),
      sensor: new FormControl(this.sensorData[0].name, [Validators.required]),
      chart: new FormControl(this.chartData[0].chartName, [Validators.required])
    });
  }

  addHandler() {
    if (this.chartData.length === 1 || this.formGroup.get('chart')?.value === 'Add new') {
      const chartItem: ChartType = this.getChartItem();
      this.chartData.push(chartItem);
      this.chartDataChange$.next(chartItem);
      this.clearFormGroup(this.formGroup);
      if (this.chartData.length === 5) {
        const findIndex = this.chartData.findIndex(ch => ch.chartName === 'Add new');
        if (findIndex > -1) {
          this.chartData.splice(findIndex, 1);
        }
      }
    } else {
      const findIndex = this.chartData.findIndex(ch => ch.chartName === this.formGroup.get('chart')?.value);
      if (findIndex > -1 && this.chartData[findIndex]) {
        const indexSensor = this.chartData[findIndex].line?.findIndex(l => l.sensor === this.formGroup.get('sensor')?.value);
        if (indexSensor === -1) {
          this.chartData[findIndex].line?.push({
            color: this.formGroup.get('color')?.value,
            sensor: this.formGroup.get('sensor')?.value
          });
          this.chartDataChange$.next(this.chartData[findIndex]);
          this.clearFormGroup(this.formGroup);
        }
      }
    }
  }

  getChartItem(): ChartType {
    const chartItem: ChartType = {
      chartName: `Chart${getRandomNumber(0, 1000)}`,
      startDate: moment(this.formGroup.get('start')?.value).format('DD.MM.YYYY'),
      endDate: moment(this.formGroup.get('end')?.value).format('DD.MM.YYYY'),
      chartType: this.formGroup.get('typeChart')?.value,
      line: [
        {sensor: this.formGroup.get('sensor')?.value, color: this.formGroup.get('color')?.value}
      ]
    };
    return chartItem;
  }

  clearFormGroup(formGr: FormGroup) {
    for(let name in formGr.controls) {
      if (name !== 'start' && name !== 'end') {
        (<FormControl>formGr.controls[name]).setValue('');
      }
    }
  }

  onChartChange(chart: any) {
    if (chart.value !== 'Add new') {
      this.formGroup.get('typeChart')?.disable();
      const findIndex = this.chartData.findIndex(ch => ch.chartName === this.formGroup.get('chart')?.value);
      if (findIndex > -1) {
        this.formGroup.get('typeChart')?.setValue(this.chartData[findIndex].chartType);
      }
    } else {
      this.formGroup.get('typeChart')?.enable();
    }
  }

  onDateChange() {
    if (this.formGroup.get('start')?.valid && this.formGroup.get('end')?.valid) {
      this.chartData.forEach(ch => {
        if (ch.chartName !== 'Add new') {
          ch.startDate = moment(this.formGroup.get('start')?.value).format('DD.MM.YYYY');
          ch.endDate = moment(this.formGroup.get('end')?.value).format('DD.MM.YYYY');
          this.chartDataChange$.next(ch);
        }
      });
    }
  }

  returnAddNew() {
    if (this.chartData.findIndex(ch => ch.chartName === 'Add new') === -1) {
      this.chartData.unshift({chartName: 'Add new'});
    }
  }
}
