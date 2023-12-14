import { Logical, Time, DataChangedScope, SeriesAttachedParameter, CrosshairMode, Coordinate } from 'lightweight-charts';
import { Point, ElliottWavesDataSource } from './data-source';
import { ElliottWavesOptions, defaultOptions } from './options';
import { ElliottWavesPaneView } from './pane-view';
import { PluginBase } from './plugin-base';
import { MouseHandlers, MousePosition } from './mouse';
import { Delegate } from './helpers/delegate';
import { PivotChangeInfo, WaveNode } from './types';
import { WavesPaneView } from './pane-view-waves';

export class ElliottWaves extends PluginBase implements ElliottWavesDataSource {
  _options: ElliottWavesOptions;
  _p1: Point;
  _p2: Point;
  _paneViews: (ElliottWavesPaneView | WavesPaneView)[];
  _mouseHandlers: MouseHandlers;
  _mousePosition: MousePosition;
  _isSelectingPivot: boolean;
  _waves: WaveNode[];
  _selectedPivot: PivotChangeInfo | null;
  _pivotChanged: Delegate<PivotChangeInfo> = new Delegate();

  constructor(p1: Point, p2: Point, options: Partial<ElliottWavesOptions> = {}) {
    super();
    this._p1 = p1;
    this._p2 = p2;
    this._options = {
      ...defaultOptions,
      ...options,
    };
    this._selectedPivot = null;
    const paneView = new ElliottWavesPaneView(this);
    const paneViewWaves = new WavesPaneView(this);
    paneView.pivotChanged().subscribe((pivot: PivotChangeInfo) => {
      this._selectedPivot = pivot;
    });
    this._paneViews = [paneView, paneViewWaves];
    this._mouseHandlers = new MouseHandlers();
    this._mousePosition = {
      x: 0 as Coordinate,
      y: 0 as Coordinate,
      x2: 0 as Coordinate,
      logical: 0 as Logical,
      xPositionRelativeToPriceScale: 0 as Coordinate,
      overPriceScale: false,
      overTimeScale: false,
    };
    this._isSelectingPivot = false;
    this._waves = [];
  }

  pivotChanged(): Delegate<PivotChangeInfo> {
    return this._pivotChanged;
  }

  updateIsSelectingPivot(isSelectingPivot: boolean): void {
    this._isSelectingPivot = isSelectingPivot;
    this.requestUpdate();
  }

  updateWaves(waves: WaveNode[]): void {
    this._waves = waves;
    this.requestUpdate();
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    super.attached(param);
    this._setCrosshairMode();

    this._mouseHandlers.attached(this.chart, this.series);
    this._mouseHandlers.clicked().subscribe((mouseUpdate: MousePosition | null) => {
      if (this._isSelectingPivot && this._selectedPivot) {
        this._pivotChanged.fire(this._selectedPivot);
        this.requestUpdate();
      }
    }, this);

    this._mouseHandlers.mouseMoved().subscribe((mouseUpdate: MousePosition | null) => {
      if (!mouseUpdate) return;
      this._mousePosition = mouseUpdate;
      this.requestUpdate();
    }, this);
  }

  detached(): void {
    this._mouseHandlers.clicked().unsubscribeAll(this);
    this._mouseHandlers.mouseMoved().unsubscribeAll(this);
    this._mouseHandlers.detached();

    super.detached();
  }

  updateAllViews() {
    //* Use this method to update any data required by the
    //* views to draw.
    this._paneViews.forEach((pw) => pw.update());
  }

  paneViews() {
    //* rendering on the main chart pane
    return this._paneViews;
  }

  dataUpdated(scope: DataChangedScope): void {
    console.log('Update ', scope);
    //* This method will be called by PluginBase when the data on the
    //* series has changed.
  }

  _timeCurrentlyVisible(time: Time, startTimePoint: Logical, endTimePoint: Logical): boolean {
    const ts = this.chart.timeScale();
    const coordinate = ts.timeToCoordinate(time);
    if (coordinate === null) return false;
    const logical = ts.coordinateToLogical(coordinate);
    if (logical === null) return false;
    return logical <= endTimePoint && logical >= startTimePoint;
  }

  public get options(): ElliottWavesOptions {
    return this._options;
  }

  applyOptions(options: Partial<ElliottWavesOptions>) {
    this._options = { ...this._options, ...options };
    this.requestUpdate();
  }

  public get p1(): Point {
    return this._p1;
  }

  public get p2(): Point {
    return this._p2;
  }

  public get mousePosition(): MousePosition {
    return this._mousePosition;
  }

  public get isSelectingPivot(): boolean {
    return this._isSelectingPivot;
  }

  public get waves(): WaveNode[] {
    return this._waves;
  }

  // We need to disable magnet mode for this to work nicely
  _setCrosshairMode() {
    if (!this.chart) {
      throw new Error('Unable to change crosshair mode because the chart instance is undefined');
    }
    this.chart.applyOptions({
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          visible: true,
        },
      },
    });
  }
}
