import { Coordinate, IChartApi, ISeriesApi, Logical, SeriesType } from 'lightweight-charts';
import { Delegate, ISubscription } from './helpers/delegate';

export interface MousePosition {
  x: Coordinate;
  x2: Coordinate;
  logical: Logical;
  y: Coordinate;
  xPositionRelativeToPriceScale: Coordinate;
  overPriceScale: boolean;
  overTimeScale: boolean;
}

type UnSubscriber = () => void;

/**
 * We are using our own mouse listeners on the container because
 * we need to know the mouse position when over the price scale
 * (in addition to the chart pane)
 */

export class MouseHandlers {
  _chart: IChartApi | undefined = undefined;
  _series: ISeriesApi<SeriesType> | undefined = undefined;
  _unSubscribers: UnSubscriber[] = [];

  private _clicked: Delegate<MousePosition | null> = new Delegate();
  private _down: Delegate<MousePosition | null> = new Delegate();
  private _up: Delegate<MousePosition | null> = new Delegate();
  private _mouseMoved: Delegate<MousePosition | null> = new Delegate();

  attached(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this._chart = chart;
    this._series = series;
    const container = this._chart.chartElement();
    this._addMouseEventListener(container, 'mouseleave', this._mouseLeave);
    this._addMouseEventListener(container, 'mousemove', this._mouseMove);
    this._addMouseEventListener(container, 'click', this._mouseClick);
    this._addMouseEventListener(container, 'mousedown', this._mouseDown);
    this._addMouseEventListener(container, 'mouseup', this._mouseUp);
  }

  detached() {
    this._series = undefined;
    this._clicked.destroy();
    this._down.destroy();
    this._up.destroy();
    this._mouseMoved.destroy();
    this._unSubscribers.forEach((unSub) => {
      unSub();
    });
    this._unSubscribers = [];
  }

  public clicked(): ISubscription<MousePosition | null> {
    return this._clicked;
  }

  public mouseMoved(): ISubscription<MousePosition | null> {
    return this._mouseMoved;
  }

  public dragStarted(): ISubscription<MousePosition | null> {
    return this._down;
  }

  public dragging(): ISubscription<MousePosition | null> {
    return this._mouseMoved;
  }

  public dragEnded(): ISubscription<MousePosition | null> {
    return this._up;
  }

  _addMouseEventListener(
    target: HTMLDivElement,
    eventType: 'mouseleave' | 'mousemove' | 'click' | 'mousedown' | 'mouseup',
    handler: (event: MouseEvent) => void,
  ): void {
    const boundMouseMoveHandler = handler.bind(this);
    target.addEventListener(eventType, boundMouseMoveHandler);
    const unSubscriber = () => {
      target.removeEventListener(eventType, boundMouseMoveHandler);
    };
    this._unSubscribers.push(unSubscriber);
  }

  _mouseLeave() {
    this._mouseMoved.fire(null);
  }
  _mouseMove(event: MouseEvent) {
    this._mouseMoved.fire(this._determineMousePosition(event));
  }
  _mouseClick(event: MouseEvent) {
    this._clicked.fire(this._determineMousePosition(event));
  }

  _mouseDown(event: MouseEvent) {
    this._down.fire(this._determineMousePosition(event));
  }

  _mouseUp(event: MouseEvent) {
    this._up.fire(this._determineMousePosition(event));
  }

  _determineMousePosition(event: MouseEvent): MousePosition | null {
    if (!this._chart || !this._series) return null;

    const element = this._chart.chartElement();
    const chartContainerBox = element.getBoundingClientRect();
    const priceScaleWidth = this._series.priceScale().width();
    const timeScaleHeight = this._chart.timeScale().height();
    const x = (event.clientX - chartContainerBox.x) as Coordinate;
    const y = (event.clientY - chartContainerBox.y) as Coordinate;
    const overTimeScale = y > element.clientHeight - timeScaleHeight;
    const xPositionRelativeToPriceScale = (element.clientWidth - priceScaleWidth - x) as Coordinate;
    const overPriceScale = xPositionRelativeToPriceScale < 0;

    const logical = this._chart.timeScale().coordinateToLogical(x) as Logical;
    const x2 = this._chart.timeScale().logicalToCoordinate(logical) as Coordinate;

    return {
      x,
      x2: x2,
      logical: logical,
      y,
      xPositionRelativeToPriceScale,
      overPriceScale,
      overTimeScale,
    };
  }
}
