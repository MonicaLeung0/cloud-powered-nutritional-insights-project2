import { useMemo, useState } from 'react'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Bubble, Pie, Scatter } from 'react-chartjs-2'
import './App.css'
import ApiActionControls from './components/ApiActionControls'
import DataPreviewPanel from './components/DataPreviewPanel'
import FilterControls from './components/FilterControls'
import PaginationControls from './components/PaginationControls'
import allDietsRows from '../example/all_diets.json'
import {
  clusterModel,
  filterPaginationModel,
  nutritionInsightModel,
  pageMetaModel,
  recipeModel,
  toCluster,
  toNutritionInsight,
  toRecipe,
} from './models'

const placeholderInsightApiRows = [
  { Diet_type: 'dash', 'Protein(g)': 69.28, 'Carbs(g)': 160.53, 'Fat(g)': 101.15 },
  { Diet_type: 'keto', 'Protein(g)': 101.26, 'Carbs(g)': 57.97, 'Fat(g)': 153.12 },
  { Diet_type: 'mediterranean', 'Protein(g)': 101.11, 'Carbs(g)': 152.9, 'Fat(g)': 101.42 },
  { Diet_type: 'paleo', 'Protein(g)': 88.67, 'Carbs(g)': 129.55, 'Fat(g)': 135.67 },
  { Diet_type: 'vegan', 'Protein(g)': 56.16, 'Carbs(g)': 254.0, 'Fat(g)': 103.3 },
  { Diet_type: 'vegetarian', 'Protein(g)': 72.4, 'Carbs(g)': 210.3, 'Fat(g)': 88.2 },
  { Diet_type: 'low-carb', 'Protein(g)': 95.3, 'Carbs(g)': 82.7, 'Fat(g)': 118.9 },
  { Diet_type: 'high-protein', 'Protein(g)': 121.5, 'Carbs(g)': 140.1, 'Fat(g)': 98.4 },
]

const placeholderRecipeApiRows = [
  {
    Diet_type: 'paleo',
    Recipe_name: 'Paleo Pumpkin Pie',
    Cuisine_type: 'american',
    'Protein(g)': 30.91,
    'Carbs(g)': 302.59,
    'Fat(g)': 96.76,
    Extraction_day: '10/16/2022',
    Extraction_time: '17:20:09',
  },
]

const placeholderClusterApiRows = [
  {
    clusterId: 1,
    Diet_type: 'keto',
    Recipe_count: 124,
    'Protein(g)': 110.2,
    'Carbs(g)': 63.5,
    'Fat(g)': 147.8,
  },
]

const chartCards = [
  {
    id: 'bar',
    title: 'Bar Chart',
    description: 'Average macronutrient content by diet type.',
  },
  {
    id: 'scatter',
    title: 'Scatter Plot',
    description: 'Nutrient relationships (e.g., protein vs carbs).',
  },
  {
    id: 'heatmap',
    title: 'Heatmap',
    description: 'Nutrient correlations.',
  },
  {
    id: 'pie',
    title: 'Pie Chart',
    description: 'Recipe distribution by diet type.',
  },
]

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
)

const nutrientKeys = ['Protein(g)', 'Carbs(g)', 'Fat(g)']
const nutrientColors = {
  'Protein(g)': '#2563eb',
  'Carbs(g)': '#10b981',
  'Fat(g)': '#f59e0b',
}

// Backend API base URL - Anmol
const API_BASE_URL = "https://group8projec2nutriinsightapi.azurewebsites.net/api"

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function App() {
  const [insights, setInsights] = useState(() =>
    placeholderInsightApiRows.map((row) => ({ ...nutritionInsightModel, ...toNutritionInsight(row) })),
  )
  const [recipes, setRecipes] = useState(() =>
    placeholderRecipeApiRows.map((row) => ({ ...recipeModel, ...toRecipe(row) })),
  )
  const [clusters, setClusters] = useState(() =>
    placeholderClusterApiRows.map((row) => ({ ...clusterModel, ...toCluster(row) })),
  )
  const [filters, setFilters] = useState(() => ({ ...filterPaginationModel }))
  const [apiStatus, setApiStatus] = useState('Backend API placeholder mode.')
  const [activeDataset, setActiveDataset] = useState('insights')
  const [activeChartId, setActiveChartId] = useState(null)
  const activeChart = chartCards.find((chart) => chart.id === activeChartId) ?? null
  const inactiveCharts = chartCards.filter((chart) => chart.id !== activeChartId)

  // Dynamic diet options based on active dataset - Anmol
  const dietOptions = useMemo(() => {
    const source =
      activeDataset === 'recipes'
        ? recipes
        : activeDataset === 'clusters'
        ? clusters
        : insights

    const optionSet = new Set(source.map((item) => item.dietType).filter(Boolean))
    return ['all', ...optionSet]
  }, [activeDataset, insights, recipes, clusters])

  const filteredInsights = useMemo(() => {
    const searchValue = filters.searchDietType.trim().toLowerCase()
    return insights.filter((item) => {
      const matchesSearch = item.dietType.toLowerCase().includes(searchValue)
      const matchesSelect =
        filters.selectedDietType === 'all' || item.dietType === filters.selectedDietType
      return matchesSearch && matchesSelect
    })
  }, [filters.searchDietType, filters.selectedDietType, insights])

  // Recipe filtering by search and dropdown - Anmol
  const filteredRecipes = useMemo(() => {
    const searchValue = filters.searchDietType.trim().toLowerCase()
    return recipes.filter((item) => {
      const matchesSearch = item.dietType.toLowerCase().includes(searchValue)
      const matchesSelect =
        filters.selectedDietType === 'all' || item.dietType === filters.selectedDietType
      return matchesSearch && matchesSelect
    })
  }, [filters.searchDietType, filters.selectedDietType, recipes])

  // Pagination source based on selected dataset - Anmol
  const activeItems = useMemo(() => {
    if (activeDataset === 'recipes') return filteredRecipes
    if (activeDataset === 'clusters') return clusters
    return filteredInsights
  }, [activeDataset, filteredInsights, filteredRecipes, clusters])

  // Shared pagination metadata for active table - Anmol
  const paginationMeta = useMemo(() => {
    const totalItems = activeItems.length
    const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize))
    const safeCurrentPage = Math.min(filters.currentPage, totalPages)
    return {
      ...pageMetaModel,
      totalItems,
      totalPages,
      currentPage: safeCurrentPage,
      pageSize: filters.pageSize,
    }
  }, [activeItems, filters.currentPage, filters.pageSize])

  const pagedInsights = useMemo(() => {
    const startIndex = (paginationMeta.currentPage - 1) * paginationMeta.pageSize
    const endIndex = startIndex + paginationMeta.pageSize
    return filteredInsights.slice(startIndex, endIndex)
  }, [filteredInsights, paginationMeta.currentPage, paginationMeta.pageSize])

  // Paginated recipe rows for current page - Anmol
  const pagedRecipes = useMemo(() => {
    const startIndex = (paginationMeta.currentPage - 1) * paginationMeta.pageSize
    const endIndex = startIndex + paginationMeta.pageSize
    return filteredRecipes.slice(startIndex, endIndex)
  }, [filteredRecipes, paginationMeta.currentPage, paginationMeta.pageSize])

  // Paginated cluster rows for current page - Anmol
  const pagedClusters = useMemo(() => {
    const startIndex = (paginationMeta.currentPage - 1) * paginationMeta.pageSize
    const endIndex = startIndex + paginationMeta.pageSize
    return clusters.slice(startIndex, endIndex)
  }, [clusters, paginationMeta.currentPage, paginationMeta.pageSize])

  const chartMetrics = useMemo(() => {
    const groupedByDiet = new Map()

    allDietsRows.forEach((row) => {
      const dietType = String(row.Diet_type ?? '').trim().toLowerCase()
      if (!dietType) {
        return
      }

      const current = groupedByDiet.get(dietType) ?? {
        dietType,
        count: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }

      current.count += 1
      current.protein += toNumber(row['Protein(g)'])
      current.carbs += toNumber(row['Carbs(g)'])
      current.fat += toNumber(row['Fat(g)'])
      groupedByDiet.set(dietType, current)
    })

    const diets = [...groupedByDiet.values()]
      .map((item) => ({
        ...item,
        avgProtein: item.count ? item.protein / item.count : 0,
        avgCarbs: item.count ? item.carbs / item.count : 0,
        avgFat: item.count ? item.fat / item.count : 0,
      }))
      .sort((a, b) => a.dietType.localeCompare(b.dietType))

    const maxAvgMacro = diets.reduce(
      (max, item) => Math.max(max, item.avgProtein, item.avgCarbs, item.avgFat),
      0,
    )

    return {
      diets,
      maxAvgMacro,
      totalRows: allDietsRows.length,
    }
  }, [])

  const barChartData = useMemo(
    () => ({
      labels: chartMetrics.diets.map((item) => item.dietType),
      datasets: nutrientKeys.map((nutrient) => {
        const valueKey =
          nutrient === 'Protein(g)' ? 'avgProtein' : nutrient === 'Carbs(g)' ? 'avgCarbs' : 'avgFat'
        return {
          label: nutrient,
          data: chartMetrics.diets.map((item) => item[valueKey]),
          backgroundColor: nutrientColors[nutrient],
          borderRadius: 6,
        }
      }),
    }),
    [chartMetrics.diets],
  )

  const scatterChartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Diet average (Protein vs Carbs)',
          data: chartMetrics.diets.map((item) => ({
            x: Number(item.avgProtein.toFixed(2)),
            y: Number(item.avgCarbs.toFixed(2)),
          })),
          pointRadius: 7,
          pointHoverRadius: 9,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#1e3a8a',
          pointBorderWidth: 1,
        },
      ],
    }),
    [chartMetrics.diets],
  )

  const heatmapChartData = useMemo(
    () => ({
      datasets: nutrientKeys.map((nutrient, nutrientIndex) => {
        const valueKey =
          nutrient === 'Protein(g)' ? 'avgProtein' : nutrient === 'Carbs(g)' ? 'avgCarbs' : 'avgFat'
        return {
          label: nutrient,
          data: chartMetrics.diets.map((item, dietIndex) => ({
            x: nutrientIndex + 1,
            y: dietIndex + 1,
            r: Math.max(4, Math.round((item[valueKey] / Math.max(chartMetrics.maxAvgMacro, 1)) * 14)),
          })),
          backgroundColor: nutrientColors[nutrient],
          borderColor: '#ffffff',
          borderWidth: 1,
        }
      }),
    }),
    [chartMetrics.diets, chartMetrics.maxAvgMacro],
  )

  const pieChartData = useMemo(
    () => ({
      labels: chartMetrics.diets.map((item) => item.dietType),
      datasets: [
        {
          label: 'Recipe distribution by diet type',
          data: chartMetrics.diets.map((item) => item.count),
          backgroundColor: [
            '#2563eb',
            '#16a34a',
            '#f59e0b',
            '#8b5cf6',
            '#ef4444',
            '#06b6d4',
            '#84cc16',
            '#f97316',
          ],
        },
      ],
    }),
    [chartMetrics.diets],
  )

  const handleSearchChange = (event) => {
    const value = event.target.value
    setFilters((previous) => ({ ...previous, searchDietType: value, currentPage: 1 }))
  }

  const handleDietTypeChange = (event) => {
    const value = event.target.value
    setFilters((previous) => ({ ...previous, selectedDietType: value, currentPage: 1 }))
  }

  const goToPreviousPage = () => {
    setFilters((previous) => ({
      ...previous,
      currentPage: Math.max(1, previous.currentPage - 1),
    }))
  }

  const goToNextPage = () => {
    setFilters((previous) => ({
      ...previous,
      currentPage: Math.min(paginationMeta.totalPages, previous.currentPage + 1),
    }))
  }
 
  // Insights button connected to backend API - Anmol
  const handleGetInsights = async () => {

    try {
      setApiStatus('Loading insights from backend...')

      const response = await fetch(
        `${API_BASE_URL}/nutritional_data?page=1&page_size=10000`
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = await response.json()

      if (!payload.Success) {
        throw new Error(payload.Message || 'API returned an unsuccessful response')
      } 

      const mappedInsights = payload.Data.map((row) => ({
        ...nutritionInsightModel,
        ...toNutritionInsight(row),
      }))

      setInsights(mappedInsights)
      setActiveDataset('insights')
      setFilters((previous) => ({ ...previous, currentPage: 1 }))
      setApiStatus(`Insights loaded from backend (${payload.Data.length} records).`)
    } catch (error) {
      console.error(error)
      setApiStatus(`Failed to load backend insights: ${error.message}`)
    }
  }

 // Recipes button connected to backend API - Anmol
  const handleGetRecipes = async () => {
    try {
      setApiStatus('Loading recipes from backend...')

      const response = await fetch(
        `${API_BASE_URL}/nutritional_data?page=1&page_size=10000`
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = await response.json()

      if (!payload.Success) {
        throw new Error(payload.Message || 'API returned an unsuccessful response')
      }

      const mappedRecipes = payload.Data.map((row) => ({
        ...recipeModel,
        ...toRecipe(row),
      }))

      setRecipes(mappedRecipes)
      setActiveDataset('recipes')
      setFilters((previous) => ({ ...previous, currentPage: 1 }))
      setApiStatus(`Recipes loaded from backend (${payload.Data.length} records).`)
    } catch (error) {
      console.error(error)
      setApiStatus(`Failed to load recipes: ${error.message}`)
    }
  }

  // Cluster data grouped from backend response - Anmol
  const handleGetClusters = async () => {
    try {
      setApiStatus('Loading clusters from backend...')

      const response = await fetch(
        `${API_BASE_URL}/nutritional_data?page=1&page_size=10000`
      ) 

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = await response.json()

      if (!payload.Success) {
        throw new Error(payload.Message || 'API returned an unsuccessful response')
      }

      const grouped = new Map()

      payload.Data.forEach((row) => {
        const dietType = String(row.Diet_type ?? '').trim().toLowerCase()
        if (!dietType) return

        const current = grouped.get(dietType) ?? {
          clusterId: grouped.size + 1,
          Diet_type: dietType,
          Recipe_count: 0,
          'Protein(g)': 0,
          'Carbs(g)': 0,
          'Fat(g)': 0,
        }

        current.Recipe_count += 1
        current['Protein(g)'] += Number(row['Protein(g)'] ?? 0)
        current['Carbs(g)'] += Number(row['Carbs(g)'] ?? 0)
        current['Fat(g)'] += Number(row['Fat(g)'] ?? 0)

        grouped.set(dietType, current)
      })

      const clusterRows = [...grouped.values()].map((item) => ({
        clusterId: item.clusterId,
        Diet_type: item.Diet_type,
        Recipe_count: item.Recipe_count,
        'Protein(g)': item.Recipe_count ? item['Protein(g)'] / item.Recipe_count : 0,
        'Carbs(g)': item.Recipe_count ? item['Carbs(g)'] / item.Recipe_count : 0,
        'Fat(g)': item.Recipe_count ? item['Fat(g)'] / item.Recipe_count : 0,
      }))

      const mappedClusters = clusterRows.map((row) => ({
        ...clusterModel,
        ...toCluster(row),
      }))

      setClusters(mappedClusters)
      setActiveDataset('clusters')
      setFilters((previous) => ({ ...previous, currentPage: 1 }))
      setApiStatus(`Clusters loaded from backend (${mappedClusters.length} groups).`)
    } catch (error) {
      console.error(error)
      setApiStatus(`Failed to load clusters: ${error.message}`)
    }
  }

  const handleChartSelect = (chartId) => {
    setActiveChartId((previous) => (previous === chartId ? null : chartId))
  }

  const renderChartVisual = (chartId, isCompact) => {
    const sharedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 350,
      },
      plugins: {
        legend: {
          display: !isCompact,
          position: 'bottom',
        },
      },
    }

    if (chartId === 'bar') {
      return (
        <Bar
          data={barChartData}
          options={{
            ...sharedOptions,
            scales: {
              x: { ticks: { autoSkip: true, maxRotation: 35, minRotation: 25 } },
              y: { beginAtZero: true, title: { display: true, text: 'Average grams' } },
            },
          }}
        />
      )
    }

    if (chartId === 'scatter') {
      return (
        <Scatter
          data={scatterChartData}
          options={{
            ...sharedOptions,
            scales: {
              x: { title: { display: true, text: 'Average Protein (g)' }, beginAtZero: true },
              y: { title: { display: true, text: 'Average Carbs (g)' }, beginAtZero: true },
            },
          }}
        />
      )
    }

    if (chartId === 'heatmap') {
      return (
        <Bubble
          data={heatmapChartData}
          options={{
            ...sharedOptions,
            scales: {
              x: {
                min: 0.5,
                max: nutrientKeys.length + 0.5,
                ticks: {
                  stepSize: 1,
                  callback: (value) => nutrientKeys[value - 1] ?? '',
                },
              },
              y: {
                min: 0.5,
                max: chartMetrics.diets.length + 0.5,
                ticks: {
                  stepSize: 1,
                  callback: (value) => chartMetrics.diets[value - 1]?.dietType ?? '',
                },
              },
            },
            plugins: {
              ...sharedOptions.plugins,
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const nutrient = nutrientKeys[context.raw.x - 1]
                    const diet = chartMetrics.diets[context.raw.y - 1]?.dietType
                    return `${diet}: ${nutrient}`
                  },
                },
              },
            },
          }}
        />
      )
    }

    return <Pie data={pieChartData} options={sharedOptions} />
  }

  return (
    <div className="app-page">
      <header className="app-header">
        <h1>Nutritional Insights</h1>
      </header>

      <main className="app-content">
        <section className="section-block">
          <h2>Explore Nutritional Insights</h2>
          <div className={`charts-layout${activeChart ? ' has-active' : ''}`}>
            {activeChart ? (
              <>
                <article
                  className="chart-card chart-card-expanded is-active"
                  role="button"
                  tabIndex={0}
                  aria-pressed={true}
                  onClick={() => handleChartSelect(activeChart.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleChartSelect(activeChart.id)
                    }
                  }}
                >
                  <span className="chart-selected-tag">Selected chart</span>
                  <h3>{activeChart.title}</h3>
                  <p>{activeChart.description}</p>
                  <div className="chart-canvas-wrap">{renderChartVisual(activeChart.id, false)}</div>
                </article>

                <div className="charts-bottom-row">
                  {inactiveCharts.map((chart) => (
                    <article
                      key={chart.id}
                      className="chart-card chart-card-mini"
                      role="button"
                      tabIndex={0}
                      aria-pressed={false}
                      onClick={() => handleChartSelect(chart.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleChartSelect(chart.id)
                        }
                      }}
                    >
                      <h3>{chart.title}</h3>
                      <div className="chart-canvas-wrap compact">{renderChartVisual(chart.id, true)}</div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="charts-grid">
                {chartCards.map((chart) => (
                  <article
                    key={chart.id}
                    className="chart-card"
                    role="button"
                    tabIndex={0}
                    aria-pressed={false}
                    onClick={() => handleChartSelect(chart.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleChartSelect(chart.id)
                      }
                    }}
                  >
                    <h3>{chart.title}</h3>
                    <p>{chart.description}</p>
                    <div className="chart-canvas-wrap">{renderChartVisual(chart.id, false)}</div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <p className="chart-footnote">
            Charts are rendered from `all_diets.json` ({chartMetrics.totalRows} records) as a backend API
            placeholder.
          </p>
        </section>

        <section className="section-block">
          <h2>Filters and Data Interaction</h2>
          <FilterControls
            searchValue={filters.searchDietType}
            selectedDietType={filters.selectedDietType}
            dietOptions={dietOptions}
            onSearchChange={handleSearchChange}
            onDietTypeChange={handleDietTypeChange}
          />
        </section>

        <section className="section-block">
          <h2>API Data Interaction</h2>
          <ApiActionControls
            onGetInsights={handleGetInsights}
            onGetRecipes={handleGetRecipes}
            onGetClusters={handleGetClusters}
            apiStatus={apiStatus}
            recipeCount={recipes.length}
            clusterCount={clusters.length}
          />
        </section>

        <section className="section-block">
          <h2>Pagination</h2>
          <DataPreviewPanel
            activeDataset={activeDataset}
            insightsPage={pagedInsights}
            recipes={pagedRecipes}
            clusters={pagedClusters}
            paginationMeta={paginationMeta}
          />
          <PaginationControls
            currentPage={paginationMeta.currentPage}
            totalPages={paginationMeta.totalPages}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
            onPageSelect={(page) =>
              setFilters((previous) => ({ ...previous, currentPage: page }))
            }
          />
          
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2025 Nutritional Insights. All Rights Reserved.</p>
      </footer>
    </div>
  )
}

export default App
