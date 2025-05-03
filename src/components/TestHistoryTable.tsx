// src/components/TestHistoryTable.tsx
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TestResult } from '../types/stats';

interface TestHistoryTableProps {
  tests: TestResult[];
}

const TestHistoryTable: React.FC<TestHistoryTableProps> = ({ tests }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>Accuracy</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Characters</TableHead>
            <TableHead>Errors</TableHead>
            <TableHead className="text-right">Personal Best</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test._id}>
              <TableCell>
                {new Date(test.date).toLocaleDateString()}
                <div className="text-xs text-muted-foreground">
                  {new Date(test.date).toLocaleTimeString()}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{test.wpm}</span> WPM
              </TableCell>
              <TableCell>
                {test.accuracy.toFixed(1)}%
              </TableCell>
              <TableCell>
                {Math.floor(test.duration / 60)}:{(test.duration % 60).toString().padStart(2, '0')}
              </TableCell>
              <TableCell>
                {test.characterCount}
              </TableCell>
              <TableCell>
                {test.errorCount}
              </TableCell>
              <TableCell className="text-right">
                {test.isPersonalBest.wpm && (
                  <Badge className="bg-blue-500 mr-1">WPM Record</Badge>
                )}
                {test.isPersonalBest.accuracy && (
                  <Badge className="bg-green-500">Accuracy Record</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestHistoryTable;