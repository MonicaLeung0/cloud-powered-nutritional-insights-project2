function ApiActionControls({
  onGetInsights,
  onGetRecipes,
  onGetClusters,
  apiStatus,
  recipeCount,
  clusterCount,
}) {
  return (
    <>
      <div className="button-row">
        <button type="button" onClick={onGetInsights}>
          Get Nutritional Insights
        </button>
        <button type="button" onClick={onGetRecipes}>
          Get Recipes
        </button>
        <button type="button" onClick={onGetClusters}>
          Get Clusters
        </button>
      </div>
      <p className="api-status">{apiStatus}</p>
      <p className="api-status">
        Recipe records: {recipeCount} | Cluster records: {clusterCount}
      </p>
    </>
  )
}

export default ApiActionControls
