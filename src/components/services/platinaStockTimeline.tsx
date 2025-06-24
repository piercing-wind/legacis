import { formatHumanDate } from '@/lib/utils'
import { StockChangeType, UserPlatinaStockHistory } from '@/prisma/generated/client'
import { TrendingUp, TrendingDown, Plus, Minus, BarChart3 } from 'lucide-react'

interface PlatinaStockTimelineProps {
  stockHistory: UserPlatinaStockHistory[]
}

const getChangeIcon = (changeType: StockChangeType, weightChange?: number) => {
  switch (changeType) {
    case 'ADDED':
      return <Plus className="w-4 h-4 text-green-600" />
    case 'REMOVED':
      return <Minus className="w-4 h-4 text-red-600" />
    case 'UPDATED':
      if (weightChange && weightChange > 0) {
        return <TrendingUp className="w-4 h-4 text-green-600" />
      } else {
        return <TrendingDown className="w-4 h-4 text-red-600" />
      }
    default:
      return <BarChart3 className="w-4 h-4 text-gray-500" />
  }
}

const getChangeColors = (changeType: StockChangeType, weightChange?: number) => {
  switch (changeType) {
    case 'ADDED':
      return {
        bg: ' border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      }
    case 'REMOVED':
      return {
        bg: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      }
    case 'UPDATED':
      if (weightChange && weightChange > 0) {
        return {
          bg: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        }
      } else {
        return {
          bg: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        }
      }
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800',
        text: 'text-gray-800 dark:text-gray-200',
        badge: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
      }
  }
}

export default function PlatinaStockTimeline ({ stockHistory }: PlatinaStockTimelineProps) {
  if (!stockHistory || stockHistory.length === 0) {
    return (
      <div className="w-full border border-platina/70 rounded-2xl p-4 mb-8">
        <h6 className="mb-4">Portfolio Change History</h6>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No portfolio changes recorded yet.
          </p>
        </div>
      </div>
    )
  }

  // Group changes by type
  const groupedChanges = stockHistory.reduce((acc, change) => {
    const weightChange = change.newWeight && change.previousWeight 
      ? change.newWeight - change.previousWeight 
      : 0

    if (change.changeType === 'ADDED') {
      acc.added.push(change)
    } else if (change.changeType === 'REMOVED') {
      acc.removed.push(change)
    } else if (change.changeType === 'UPDATED') {
      if (weightChange > 0) {
        acc.increased.push(change)
      } else {
        acc.decreased.push(change)
      }
    }
    return acc
  }, {
    added: [] as UserPlatinaStockHistory[],
    removed: [] as UserPlatinaStockHistory[],
    increased: [] as UserPlatinaStockHistory[],
    decreased: [] as UserPlatinaStockHistory[]
  })

  const TimelineSection = ({ 
    title, 
    icon,
    changes, 
    sectionColor 
  }: {
    title: string
    icon: React.ReactNode
    changes: UserPlatinaStockHistory[]
    sectionColor: string
  }) => {
    if (changes.length === 0) return null

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${sectionColor}`}></div>
          {icon}
          <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title} ({changes.length})
          </h6>
        </div>
        <div className="space-y-2">
          {changes.map((change) => {
            const weightChange = change.newWeight && change.previousWeight 
              ? change.newWeight - change.previousWeight 
              : 0
            const colors = getChangeColors(change.changeType, weightChange)
            
            return (
              <div
                key={change.id}
                className={`p-3 rounded-lg border ${colors.bg}`}
              >
                <div className="flex flex-col md:flex-row items-start justify-between relative">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getChangeIcon(change.changeType, weightChange)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {change.stockName}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium`}>
                          {change.stockTicker}
                        </span>
                      </div>
                      

                    </div>
                  </div>
                  
                  <div className="text-right ml-4 flex gap-4 items-center">
                     {/* Weight change details */}
                      {change.changeType === 'UPDATED' && change.previousWeight && change.newWeight && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Previous:</span>
                            <span className="font-medium">{change.previousWeight}%</span>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">New:</span>
                            <span className="font-medium">{change.newWeight}%</span>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                            weightChange > 0 
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          }`}>
                            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      
                      {/* Added stock weight */}
                      {change.changeType === 'ADDED' && change.newWeight && (
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Portfolio Weight: </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {change.newWeight}%
                          </span>
                        </div>
                      )}
                      
                      {/* Removed stock weight */}
                      {change.changeType === 'REMOVED' && change.previousWeight && (
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Previous Weight: </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {change.previousWeight}%
                          </span>
                        </div>
                      )}
                    <span className="text-xs absolute md:relative top-[1px] right-[1px] text-gray-500 dark:text-gray-400">
                      {formatHumanDate(change.changeDate)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border border-platina/70 rounded-2xl p-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h6 className="text-base font-semibold">Portfolio Change History</h6>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-1">
        <TimelineSection
          title="Added Stocks"
          icon={<Plus className="w-4 h-4 text-green-600" />}
          changes={groupedChanges.added}
          sectionColor="bg-green-500"
        />
        
        <TimelineSection
          title="Increased Weights"
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          changes={groupedChanges.increased}
          sectionColor="bg-green-400"
        />
        
        <TimelineSection
          title="Decreased Weights"
          icon={<TrendingDown className="w-4 h-4 text-red-600" />}
          changes={groupedChanges.decreased}
          sectionColor="bg-red-400"
        />
        
        <TimelineSection
          title="Removed Stocks"
          icon={<Minus className="w-4 h-4 text-red-600" />}
          changes={groupedChanges.removed}
          sectionColor="bg-red-500"
        />
      </div>
    </div>
  )
}