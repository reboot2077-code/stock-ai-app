import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, Line, Polyline, G, Text as SvgText } from 'react-native-svg';
import type { KLineItem } from '../types';
import { Colors } from '../constants/colors';

interface Props {
  data: KLineItem[];
  ma5: (number | null)[];
  ma10: (number | null)[];
  ma20: (number | null)[];
  ma60: (number | null)[];
}

const SCREEN_W = Dimensions.get('window').width;
const CHART_H = 260;
const VOL_H = 70;
const PADDING = { top: 10, right: 12, bottom: 0, left: 4 };
const CANDLE_W = 7;
const GAP = 1;
const TOTAL_W = SCREEN_W - 32;
const MA_COLORS = ['#FFD740', '#FF9800', '#E040FB', '#00BCD4'];
const RISE_COLOR = Colors.rise;
const FALL_COLOR = Colors.fall;

export default function KLineChart({ data, ma5, ma10, ma20, ma60 }: Props) {
  const visible = useMemo(() => data.slice(-60), [data]);
  const chartW = visible.length * (CANDLE_W + GAP);
  const chartAreaW = Math.min(chartW, TOTAL_W - PADDING.left - PADDING.right);

  const { priceMin, priceMax, volMax } = useMemo(() => {
    let pMin = Infinity, pMax = -Infinity, vMax = 0;
    for (const d of visible) {
      if (d.high > pMax) pMax = d.high;
      if (d.low < pMin) pMin = d.low;
      if (d.volume > vMax) vMax = d.volume;
    }
    return { priceMin: pMin, priceMax: pMax, volMax: vMax };
  }, [visible]);

  const priceRange = priceMax - priceMin || 1;
  const scaleY = (v: number) => PADDING.top + ((priceMax - v) / priceRange) * CHART_H;
  const scaleVol = (v: number) => (v / (volMax || 1)) * VOL_H;

  const maLines = [ma5, ma10, ma20, ma60];
  const visibleMaData: (number | null)[][] = maLines.map((ma) => {
    const start = data.length - visible.length;
    return ma.slice(start, start + visible.length);
  });

  const candles = visible.map((d, i) => {
    const x = i * (CANDLE_W + GAP);
    const isRise = d.close >= d.open;
    const color = isRise ? RISE_COLOR : FALL_COLOR;
    const bodyTop = scaleY(Math.max(d.open, d.close));
    const bodyH = Math.max(1, Math.abs(scaleY(d.open) - scaleY(d.close)));
    const centerX = x + CANDLE_W / 2;
    return (
      <G key={i}>
        <Line x1={centerX} y1={scaleY(d.high)} x2={centerX} y2={scaleY(d.low)}
              stroke={color} strokeWidth={1} />
        <Rect x={x} y={bodyTop} width={CANDLE_W} height={bodyH} fill={color} />
      </G>
    );
  });

  const maPaths = visibleMaData.map((ma, mi) => {
    const points: string[] = [];
    ma.forEach((v, i) => {
      if (v != null) {
        points.push(`${i * (CANDLE_W + GAP) + CANDLE_W / 2},${scaleY(v)}`);
      }
    });
    if (points.length < 2) return null;
    return (
      <Polyline key={mi} points={points.join(' ')} fill="none"
                stroke={MA_COLORS[mi]} strokeWidth={1} />
    );
  });

  const volBars = visible.map((d, i) => {
    const x = i * (CANDLE_W + GAP);
    const isRise = d.close >= d.open;
    const color = isRise ? RISE_COLOR : FALL_COLOR;
    const h = scaleVol(d.volume);
    return (
      <Rect key={i} x={x} y={CHART_H + 30 + VOL_H - h}
            width={CANDLE_W} height={Math.max(1, h)}
            fill={color} opacity={0.5} />
    );
  });

  return (
    <View>
      <Svg width={Math.max(chartW, TOTAL_W)} height={CHART_H + VOL_H + 40}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <Line key={i} x1={0} y1={PADDING.top + r * CHART_H}
                x2={Math.max(chartW, TOTAL_W)} y2={PADDING.top + r * CHART_H}
                stroke={Colors.border} strokeWidth={0.5} strokeDasharray="4,4" />
        ))}
        {/* Price labels */}
        {[0, 0.5, 1].map((r, i) => (
          <SvgText key={i} x={TOTAL_W - 2} y={PADDING.top + r * CHART_H + 4}
                   fill={Colors.textSecondary} fontSize={9} textAnchor="end">
            {(priceMax - r * priceRange).toFixed(2)}
          </SvgText>
        ))}
        {candles}
        {maPaths}
        {/* Volume separator */}
        <Line x1={0} y1={CHART_H + 20} x2={Math.max(chartW, TOTAL_W)}
              y2={CHART_H + 20} stroke={Colors.border} strokeWidth={0.5} />
        {volBars}
      </Svg>
      {/* Legend */}
      <View className="flex-row justify-center mt-2 space-x-3">
        {['MA5', 'MA10', 'MA20', 'MA60'].map((label, i) => (
          <View key={label} className="flex-row items-center">
            <View style={{ width: 10, height: 2, backgroundColor: MA_COLORS[i] }} />
            <Text className="text-[10px] text-text-secondary ml-1">{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
