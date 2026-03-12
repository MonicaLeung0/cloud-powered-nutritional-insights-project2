function formatNumber(value) {
  return Number(value).toFixed(2)
}

function DataPreviewPanel({ activeDataset, insightsPage, recipes, clusters, paginationMeta }) {
  if (activeDataset === 'recipes') {
    return (
      <div className="data-preview">
        <h3>Recipe Data</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Diet Type</th>
                <th>Recipe Name</th>
                <th>Cuisine</th>
                <th>Protein(g)</th>
                <th>Carbs(g)</th>
                <th>Fat(g)</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((row, index) => (
                <tr key={`${row.recipeName}-${index}`}>
                  <td>{row.dietType}</td>
                  <td>{row.recipeName}</td>
                  <td>{row.cuisineType}</td>
                  <td>{formatNumber(row.proteinG)}</td>
                  <td>{formatNumber(row.carbsG)}</td>
                  <td>{formatNumber(row.fatG)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (activeDataset === 'clusters') {
    return (
      <div className="data-preview">
        <h3>Cluster Data</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cluster ID</th>
                <th>Diet Type</th>
                <th>Recipe Count</th>
                <th>Avg Protein(g)</th>
                <th>Avg Carbs(g)</th>
                <th>Avg Fat(g)</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((row, index) => (
                <tr key={`${row.clusterId}-${index}`}>
                  <td>{row.clusterId}</td>
                  <td>{row.dietType}</td>
                  <td>{row.recipeCount}</td>
                  <td>{formatNumber(row.avgProteinG)}</td>
                  <td>{formatNumber(row.avgCarbsG)}</td>
                  <td>{formatNumber(row.avgFatG)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="data-preview">
      <h3>Nutritional Insight Data</h3>
      <p className="preview-meta">
        Showing page {paginationMeta.currentPage} of {paginationMeta.totalPages} ({paginationMeta.totalItems}{' '}
        records)
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Diet Type</th>
              <th>Protein(g)</th>
              <th>Carbs(g)</th>
              <th>Fat(g)</th>
            </tr>
          </thead>
          <tbody>
            {insightsPage.map((row, index) => (
              <tr key={`${row.dietType}-${index}`}>
                <td>{row.dietType}</td>
                <td>{formatNumber(row.proteinG)}</td>
                <td>{formatNumber(row.carbsG)}</td>
                <td>{formatNumber(row.fatG)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataPreviewPanel
