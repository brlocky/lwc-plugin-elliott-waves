import {
	Coordinate,
	ISeriesPrimitivePaneView,
	SeriesPrimitivePaneViewZOrder,
} from 'lightweight-charts';
import { ElliottWavesAxisPaneRenderer } from './axis-pane-renderer';
import { ElliottWavesDataSource } from './data-source';

abstract class ElliottWavesAxisPaneView implements ISeriesPrimitivePaneView {
	_source: ElliottWavesDataSource;
	_p1: number | null = null;
	_p2: number | null = null;
	_vertical: boolean = false;

	constructor(source: ElliottWavesDataSource, vertical: boolean) {
		this._source = source;
		this._vertical = vertical;
	}

	abstract getPoints(): [Coordinate | null, Coordinate | null];

	update() {
		[this._p1, this._p2] = this.getPoints();
	}

	renderer() {
		return new ElliottWavesAxisPaneRenderer(
			this._p1,
			this._p2,
			this._source.options.fillColor,
			this._vertical
		);
	}
	zOrder(): SeriesPrimitivePaneViewZOrder {
		return 'bottom';
	}
}

export class ElliottWavesPriceAxisPaneView extends ElliottWavesAxisPaneView {
	getPoints(): [Coordinate | null, Coordinate | null] {
		const series = this._source.series;
		const y1 = series.priceToCoordinate(this._source.p1.price);
		const y2 = series.priceToCoordinate(this._source.p2.price);
		return [y1, y2];
	}
}

export class ElliottWavesTimeAxisPaneView extends ElliottWavesAxisPaneView {
	getPoints(): [Coordinate | null, Coordinate | null] {
		const timeScale = this._source.chart.timeScale();
		const x1 = timeScale.timeToCoordinate(this._source.p1.time);
		const x2 = timeScale.timeToCoordinate(this._source.p2.time);
		return [x1, x2];
	}
}
