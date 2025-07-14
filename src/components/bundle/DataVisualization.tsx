
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DataVisualizationProps {
  bundle: any;
  csvData: any[];
}

export default function DataVisualization({ bundle, csvData }: DataVisualizationProps) {
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [colorBy, setColorBy] = useState<string>('none');

  const getColumns = () => {
    if (!csvData.length) return [];
    return Object.keys(csvData[0]);
  };

  const getNumericColumns = () => {
    if (!csvData.length) return [];
    const columns = Object.keys(csvData[0]);
    return columns.filter(col => {
      const values = csvData.map(row => row[col]).filter(val => val !== '' && val !== null);
      const numericValues = values.filter(val => !isNaN(Number(val)));
      return numericValues.length > values.length * 0.8;
    });
  };

  const getCategoricalColumns = () => {
    const numericCols = getNumericColumns();
    return getColumns().filter(col => !numericCols.includes(col));
  };

  const prepareChartData = () => {
    if (!xAxis || !csvData.length) return [];

    if (chartType === 'histogram') {
      // For histogram, create frequency bins
      const values = csvData.map(row => Number(row[xAxis])).filter(val => !isNaN(val));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const bins = 10;
      const binSize = (max - min) / bins;
      
      const histogram = Array.from({ length: bins }, (_, i) => ({
        range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
        count: 0
      }));
      
      values.forEach(val => {
        const binIndex = Math.min(Math.floor((val - min) / binSize), bins - 1);
        histogram[binIndex].count++;
      });
      
      return histogram;
    }

    if (chartType === 'pie') {
      // For pie chart, aggregate by categories
      const categoryCount: { [key: string]: number } = {};
      csvData.forEach(row => {
        const category = row[xAxis] || 'Unknown';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      
      return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
    }

    // For other charts, use raw data
    return csvData.map(row => {
      const item: any = {};
      if (xAxis) item[xAxis] = isNaN(Number(row[xAxis])) ? row[xAxis] : Number(row[xAxis]);
      if (yAxis) item[yAxis] = isNaN(Number(row[yAxis])) ? row[yAxis] : Number(row[yAxis]);
      if (colorBy && colorBy !== 'none') item[colorBy] = row[colorBy];
      return item;
    }).filter(item => item[xAxis] !== undefined && (!yAxis || item[yAxis] !== undefined));
  };

  const renderChart = () => {
    const data = prepareChartData();
    if (!data.length) return <div className="text-center py-8 text-amber-600">No data to display</div>;

    const colors = ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'];

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              {yAxis && <YAxis />}
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxis || 'count'} fill="#D97706" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              {yAxis && <YAxis />}
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxis} stroke="#D97706" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              {yAxis && <YAxis dataKey={yAxis} />}
              <Tooltip />
              <Legend />
              <Scatter dataKey={yAxis} fill="#D97706" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#D97706" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center py-8 text-amber-600">Select chart type and axes</div>;
    }
  };

  const columns = getColumns();
  const numericColumns = getNumericColumns();
  const categoricalColumns = getCategoricalColumns();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Chart Configuration</CardTitle>
          <CardDescription>
            Configure your chart parameters and visualization options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Chart Type
              </label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="histogram">Histogram</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-700 mb-2">
                X-Axis
              </label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartType !== 'histogram' && chartType !== 'pie' && (
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Y-Axis
                </label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Y-axis" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(chartType === 'scatter' || chartType === 'line') && (
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Color By (Optional)
                </label>
                <Select value={colorBy} onValueChange={setColorBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categoricalColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Visualization</CardTitle>
          <CardDescription>
            Interactive chart based on your selected parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Chart Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Chart Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
            <div>
              <h4 className="font-medium mb-2">Chart Types:</h4>
              <ul className="space-y-1">
                <li>• <strong>Bar Chart:</strong> Compare categories or show distributions</li>
                <li>• <strong>Line Chart:</strong> Show trends over time or continuous data</li>
                <li>• <strong>Scatter Plot:</strong> Explore relationships between two variables</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tips:</h4>
              <ul className="space-y-1">
                <li>• <strong>Histogram:</strong> Shows frequency distribution of a single variable</li>
                <li>• <strong>Pie Chart:</strong> Shows composition of categorical data</li>
                <li>• Hover over chart elements for detailed information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
