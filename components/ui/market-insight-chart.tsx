"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { MarketChartData } from '@/lib/types'

interface MarketInsightChartProps {
  chartData: MarketChartData
  title?: string
  description?: string
}

export function MarketInsightChart({ 
  chartData, 
  title = "Market Insights", 
  description = "NFT market trends over time" 
}: MarketInsightChartProps) {
  
  // Transform the data for recharts
  const transformedData = chartData.block_dates.map((date, index) => {
    const dataPoint: any = { date };
    chartData.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index] || 0;
    });
    return dataPoint;
  });

  // Create chart config from datasets
  const chartConfig: ChartConfig = {
    ...chartData.datasets.reduce((config, dataset, index) => {
      config[dataset.label] = {
        label: dataset.label,
        color: dataset.color || `var(--chart-${index + 1})`,
      };
      return config;
    }, {} as ChartConfig)
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={transformedData}>
            <defs>
              {chartData.datasets.map((dataset, index) => (
                <linearGradient key={dataset.label} id={`fill${dataset.label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={dataset.color || `var(--chart-${index + 1})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={dataset.color || `var(--chart-${index + 1})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit"
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Format large numbers
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`
                }
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {chartData.datasets.map((dataset, index) => (
              <Area
                key={dataset.label}
                dataKey={dataset.label}
                type="monotone"
                fill={`url(#fill${dataset.label})`}
                stroke={dataset.color || `var(--chart-${index + 1})`}
                stackId={chartData.datasets.length > 1 ? "a" : undefined}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
