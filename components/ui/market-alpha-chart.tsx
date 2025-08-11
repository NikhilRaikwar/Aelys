"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"

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
  chartData?: MarketChartData
  title?: string
  description?: string
}

export function MarketAlphaChart({ 
  chartData, 
  title = "Market Alpha Analytics", 
  description = "NFT market trends over time" 
}: MarketInsightChartProps) {
  
  // Validate chartData structure
  if (!chartData) {
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
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No chart data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(chartData.block_dates)) {
    console.error('chartData.block_dates is not an array:', chartData.block_dates);
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
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Invalid chart data format</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(chartData.datasets) || chartData.datasets.length === 0) {
    console.error('chartData.datasets is not an array or is empty:', chartData.datasets);
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
          <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No datasets available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Transform the data for recharts with proper date formatting
  const transformedData = chartData.block_dates.map((date, index) => {
    // Handle different date formats and ensure proper parsing
    let formattedDate;
    try {
      // Remove any quotes and parse the date
      const cleanDate = typeof date === 'string' ? date.replace(/"/g, '') : date;
      const parsedDate = new Date(cleanDate);
      
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        // If invalid, create a sequential date based on index
        const now = new Date();
        formattedDate = new Date(now.getTime() - (chartData.block_dates.length - index - 1) * 60 * 60 * 1000).toISOString();
      } else {
        formattedDate = parsedDate.toISOString();
      }
    } catch (error) {
      // Fallback: create sequential dates
      const now = new Date();
      formattedDate = new Date(now.getTime() - (chartData.block_dates.length - index - 1) * 60 * 60 * 1000).toISOString();
    }
    
    const dataPoint: any = { date: formattedDate };
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
          <LineChart data={transformedData}>
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
              <Line
                key={dataset.label}
                dataKey={dataset.label}
                type="monotone"
                stroke={dataset.color || `var(--chart-${index + 1})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
