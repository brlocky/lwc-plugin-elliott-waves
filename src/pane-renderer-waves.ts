import { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas';
import { ISeriesPrimitivePaneRenderer } from 'lightweight-charts';
import { positionsLine } from './helpers/dimensions/positions';
import { averageWidthPerCharacter, centreLabelHeight, centreLabelInlinePadding } from './constants';
import { PivotType, UIPivot } from './types';

export class WavesPaneRenderer implements ISeriesPrimitivePaneRenderer {
  _pivots: UIPivot[];

  constructor(pivots: UIPivot[]) {
    this._pivots = pivots;
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      // this._drawTradingLineLabels(scope);
      this._drawPivots(scope, this._pivots);

      /* // Check if the crosshair is over any pivot
      this._pivots.forEach((pivot) => {
        if (this._isHovered(pivot, crosshairX, crosshairY)) {
          // Do something when the crosshair is over the pivot
          console.log('Crosshair is over a pivot:', pivot);
        }
      }); */
    });
  }

  _isHovered(pivot: UIPivot, crosshairX: number, crosshairY: number): boolean {
    // Check if the crosshair is over the pivot
    // Implement the logic based on your requirements
    const vPadding = pivot.type === PivotType.HIGH ? -20 : 20;
    const labelWidth = this._calculateLabelWidth((pivot.wave?.toString() || '').length);
    const labelXDimensions = positionsLine(pivot.x as number, 1, labelWidth);
    const yDimensions = positionsLine(pivot.y + vPadding, 1, centreLabelHeight);

    return (
      crosshairX >= labelXDimensions.position &&
      crosshairX <= labelXDimensions.position + labelXDimensions.length &&
      crosshairY >= yDimensions.position &&
      crosshairY <= yDimensions.position + yDimensions.length
    );
  }

  _calculateLabelWidth(textLength: number) {
    return centreLabelInlinePadding * 2 + 2 * textLength * averageWidthPerCharacter;
  }

  _drawPivots(scope: BitmapCoordinatesRenderingScope, pivots: UIPivot[]) {
    if (!pivots.length) return;

    pivots.forEach((p) => {
      this._drawPivot(scope, p);

      if (p.children && p.children.length > 0) {
        // Recursively draw children
        this._drawPivots(scope, p.children);
      }
    });
  }

  _drawPivot(scope: BitmapCoordinatesRenderingScope, pivot: UIPivot) {
    const ctx = scope.context;
    let text = pivot.wave?.toString() || ('- ' as string);

    const labelWidth = this._calculateLabelWidth(text.length);
    const labelXDimensions = positionsLine(pivot.x as number, scope.horizontalPixelRatio, labelWidth);
    const yDimensions = positionsLine(pivot.y, scope.verticalPixelRatio, centreLabelHeight);

    const radius = 4 * scope.horizontalPixelRatio;
    // draw main body background of label
    ctx.beginPath();
    ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    if (pivot.isHover) {
      // draw hover background for remove button
      ctx.beginPath();
      ctx.roundRect(labelXDimensions.position, yDimensions.position, labelXDimensions.length, yDimensions.length, [0, radius, radius, 0]);
      //ctx.fillStyle = '#F0F3FA';
      ctx.fillStyle = '#FF0000';
      ctx.fill();
    }

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
    // ctx.font = `${Math.round(12 * scope.verticalPixelRatio)}px EW`;
    ctx.font = `${Math.round(20 * scope.verticalPixelRatio)}px arial`;

    ctx.fillText(
      text,
      labelXDimensions.position + centreLabelInlinePadding * scope.horizontalPixelRatio,
      pivot.y * scope.verticalPixelRatio,
    );
  }
}
