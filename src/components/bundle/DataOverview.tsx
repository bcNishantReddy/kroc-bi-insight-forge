
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, FileText, AlertTriangle, TrendingUp } from "lucide-react";

interface DataOverviewProps {
  bundle: any;
  csvData: any[];
}

export default function DataOverview({ bundle, csvData }: DataOverviewProps) {
  const getColumnStats = () => {
    if (!csvData.length) return [];
    
    const headers = Object.keys(csvData[0]);
    return headers.map(header => {
      const values = csvData.map(row => row[header]).filter(val => val !== '' && val !== null);
      const nonNullCount = values.length;
      const missingCount = csvData.length - nonNullCount;
      
      // Determine data type
      const numericValues = values.filter(val => !isNaN(Number(val)));
      const isNumeric = numericValues.length > values.length * 0.8;
      
      return {
        name: header,
        type: isNumeric ? 'Numeric' : 'Categorical',
        nonNull: nonNullCount,
        missing: missingCount,
        missingPercent: ((missingCount / csvData.length) * 100).toFixed(1)
      };
    });
  };

  const columnStats = getColumnStats();
  const numericColumns = columnStats.filter(col => col.type === 'Numeric').length;
  const categoricalColumns = columnStats.filter(col => col.type === 'Categorical').length;
  const totalMissing = columnStats.reduce((sum, col) => sum + col.missing, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
            <Database className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {csvData.length.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Columns</CardTitle>
            <FileText className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {columnStats.length}
            </div>
            <p className="text-xs text-amber-600">
              {numericColumns} numeric, {categoricalColumns} categorical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Values</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {totalMissing.toLocaleString()}
            </div>
            <p className="text-xs text-amber-600">
              {((totalMissing / (csvData.length * columnStats.length)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {bundle.file_size ? `${(bundle.file_size / 1024).toFixed(1)} KB` : 'Unknown'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Column Information</CardTitle>
          <CardDescription>
            Detailed statistics for each column in your dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Non-null Count</TableHead>
                <TableHead>Missing Count</TableHead>
                <TableHead>Missing %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columnStats.map((col, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{col.name}</TableCell>
                  <TableCell>
                    <Badge variant={col.type === 'Numeric' ? 'default' : 'secondary'}>
                      {col.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{col.nonNull.toLocaleString()}</TableCell>
                  <TableCell>{col.missing.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={col.missing > 0 ? 'text-red-600' : 'text-green-600'}>
                      {col.missingPercent}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-800">Data Preview</CardTitle>
          <CardDescription>
            First 10 rows of your dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnStats.map((col, index) => (
                    <TableHead key={index}>{col.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {columnStats.map((col, colIndex) => (
                      <TableCell key={colIndex}>
                        {row[col.name] || <span className="text-gray-400">—</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
