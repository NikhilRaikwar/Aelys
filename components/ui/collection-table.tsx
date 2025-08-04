"use client"

import React from 'react';
import { TableData } from '@/lib/types';

interface CollectionTableProps {
  data: TableData;
}

export function CollectionTable({ data }: CollectionTableProps) {
  return (
    <div className="w-full mt-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Title */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.title}</h3>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {data.headers.map((header, index) => (
                  <th 
                    key={index} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {/* Handle image cells */}
                      {typeof cell === 'string' && cell.includes('<img') ? (
                        <div dangerouslySetInnerHTML={{ __html: cell }} />
                      ) : (
                        <div className="max-w-xs truncate" title={String(cell)}>
                          {String(cell)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {data.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="flex justify-between items-start py-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {data.headers[cellIndex]}
                  </span>
                  <div className="ml-4 flex-1 text-right">
                    {/* Handle image cells */}
                    {typeof cell === 'string' && cell.includes('<img') ? (
                      <div dangerouslySetInnerHTML={{ __html: cell }} />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {String(cell)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
