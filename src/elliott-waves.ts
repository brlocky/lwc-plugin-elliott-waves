import {
  Logical,
  Time,
  DataChangedScope,
  SeriesAttachedParameter,
  CrosshairMode,
  Coordinate,
  PrimitiveHoveredItem,
} from 'lightweight-charts';
import { ElliottWavesDataSource } from './data-source';
import { ElliottWavesOptions, defaultOptions } from './options';
import { ElliottWavesPaneView } from './pane-view';
import { PluginBase } from './plugin-base';
import { MouseHandlers, MousePosition } from './mouse';
import { Delegate } from './helpers/delegate';
import { ISeriesPrimitivePaneViewWithHover, PivotChangeInfo, SubCountInfo, WavePivot } from './types';
import { WavesPaneView } from './pane-view-waves';

export class ElliottWaves extends PluginBase implements ElliottWavesDataSource {
  _options: ElliottWavesOptions;
  _paneViews: ISeriesPrimitivePaneViewWithHover[];
  _mouseHandlers: MouseHandlers;
  _mousePosition: MousePosition;
  _isSelectingPivot: boolean;
  _pivots: WavePivot[];
  _selectedPivot: PivotChangeInfo | null;
  _pivotChanged: Delegate<PivotChangeInfo> = new Delegate();
  _pivotSubCountClicked: Delegate<SubCountInfo> = new Delegate();
  _hoverPivot: WavePivot | null;

  constructor(options: Partial<ElliottWavesOptions> = {}) {
    super();
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
    this._pivots = [];
    this._hoverPivot = null;
  }

  pivotChanged(): Delegate<PivotChangeInfo> {
    return this._pivotChanged;
  }

  pivotSubCountClicked(): Delegate<SubCountInfo> {
    return this._pivotSubCountClicked;
  }

  /**
   * Hit test method which will be called by the library when the cursor is moved.
   * Use this to register object ids being hovered for use within the crosshairMoved
   * and click events emitted by the chart. Additionally, the hit test result can
   * specify a preferred cursor type to display for the main chart pane. This method
   * should return the top most hit for this primitive if more than one object is
   * being intersected.
   *
   * @param x - x Coordinate of mouse event
   * @param y - y Coordinate of mouse event
   */
  hitTest(x: number, y: number): PrimitiveHoveredItem | null {
    const elliottPane = this._paneViews[1];
    this._hoverPivot = elliottPane.isHover(x, y);
    if (this._hoverPivot) {
      return {
        externalId: 'elliott-waves',
        cursorStyle: 'pointer',
        zOrder: 'top', // "bottom" | "normal" | "top
        isBackground: false,
      };
    }

    return null;
  }

  updateIsSelectingPivot(isSelectingPivot: boolean): void {
    this._isSelectingPivot = isSelectingPivot;
    this.requestUpdate();
  }

  updatePivots(pivots: WavePivot[]): void {
    this._pivots = [...pivots];
    this.requestUpdate();
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    super.attached(param);
    this._setCrosshairMode();

    this._mouseHandlers.attached(this.chart, this.series);
    this._mouseHandlers.clicked().subscribe((_: MousePosition | null) => {
      if (this._isSelectingPivot && this._selectedPivot) {
        this._pivotChanged.fire(this._selectedPivot);
        this.requestUpdate();
      }

      if (this._hoverPivot) {
        const pivotTo = this.findNextPivot(this._hoverPivot);
        this._pivotSubCountClicked.fire({
          pivotFrom: this._hoverPivot,
          pivotTo: pivotTo || undefined,
        });
      }
    }, this);

    this._mouseHandlers.mouseMoved().subscribe((mouseUpdate: MousePosition | null) => {
      if (!mouseUpdate) return;
      this._mousePosition = mouseUpdate;
      this.requestUpdate();
    }, this);
  }

  findNextPivot(pivot: WavePivot): WavePivot | null {
    const index = this._pivots.findIndex((piv) => {
      return piv.wave === pivot.wave && piv.degree === pivot.degree && piv.time === pivot.time;
    });
    if (index === -1) {
      console.log('Could not find index =???????', this._pivots);
      return null;
    }
    for (let i = index + 1; i < this._pivots.length; i++) {
      const p = this._pivots[i];
      if (p.degree === p.degree && (p.wave === pivot.wave || p.wave === pivot.wave + 1)) {
        return p;
      }
    }

    return null;
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

  public get mousePosition(): MousePosition {
    return this._mousePosition;
  }

  public get isSelectingPivot(): boolean {
    return this._isSelectingPivot;
  }

  public get pivots(): WavePivot[] {
    return this._pivots;
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
