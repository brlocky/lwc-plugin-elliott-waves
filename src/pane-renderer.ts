import { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas';
import { ISeriesPrimitivePaneRenderer } from 'lightweight-charts';
import { ViewPoint } from './pane-view';
import { positionsLine } from './helpers/dimensions/positions';
import { averageWidthPerCharacter, centreLabelHeight, centreLabelInlinePadding } from './constants';

export class ElliottWavesPaneRenderer implements ISeriesPrimitivePaneRenderer {
  _pivot: ViewPoint | null;
  _fillColor: string;

  constructor(pivot: ViewPoint | null, fillColor: string) {
    this._pivot = pivot;
    this._fillColor = fillColor;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      // this._drawTradingLineLabels(scope);
      this._drawPivotPicker(scope);
    });
  }

  _calculateLabelWidth(textLength: number) {
    return centreLabelInlinePadding * 2 + textLength * averageWidthPerCharacter;
  }

  _drawPivotPicker(scope: BitmapCoordinatesRenderingScope) {
    if (!this._pivot) return;
    const ctx = scope.context;
    const crosshairPosX = positionsLine(this._pivot.x, scope.horizontalPixelRatio, 12);
    const crosshairPosY = positionsLine(this._pivot.y as number, scope.verticalPixelRatio, 12);

    ctx.beginPath();
    ctx.roundRect(crosshairPosX.position, crosshairPosY.position, 20, 20, 20 * scope.horizontalPixelRatio);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1 * scope.horizontalPixelRatio;
    ctx.stroke();
  }

  _drawTradingLineLabels(scope: BitmapCoordinatesRenderingScope) {
    if (!this._pivot) return;

    const ctx = scope.context;
    const text = ' 1 ';

    const labelWidth = this._calculateLabelWidth(text.length);
    const labelXDimensions = positionsLine(this._pivot.x, scope.horizontalPixelRatio, labelWidth);
    const yDimensions = positionsLine(this._pivot.y, scope.verticalPixelRatio, centreLabelHeight);

    const radius = 4 * scope.horizontalPixelRatio;
    // draw main body background of label
    ctx.beginPath();
    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // draw stroke for main body
    ctx.beginPath();
    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
    ctx.strokeStyle = '#131722';
    ctx.lineWidth = 1 * scope.horizontalPixelRatio;
    ctx.stroke();

    // write text
    ctx.beginPath();
    ctx.fillStyle = '#131722';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(12 * scope.verticalPixelRatio)}px sans-serif`;
    ctx.fillText(
      text,
      labelXDimensions.position + centreLabelInlinePadding * scope.horizontalPixelRatio,
      this._pivot.y * scope.verticalPixelRatio,
    );
  }
}
