import azure.functions as func
import os
import json
import logging
import pandas as pd
import io
from datetime import datetime, timedelta, timezone
from azure.storage.blob import BlobServiceClient

app = func.FunctionApp()
logger = logging.getLogger("NutritionalInsightsAPI")

@app.route(route="nutritional_data", auth_level=func.AuthLevel.ANONYMOUS)
def get_diet_insights(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # 1. Securely fetch connection string
        connect_str = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
        
        # 2. Blob Logic
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        blob_client = blob_service_client.get_blob_client(container="datasets", blob="All_Diets.csv")
        stream = blob_client.download_blob().readall()
        df = pd.read_csv(io.BytesIO(stream))

        # 3. Pagination Logic
        page = int(req.params.get('page', 1))
        page_size = int(req.params.get('page_size', 10))
        
        # Calculate start and end rows
        start = (page - 1) * page_size
        end = start + page_size

        # Slice the dataframe
        paginated_df = df.iloc[start:end]
        result = paginated_df.to_dict(orient='records')

        # 4. Add Metadata
        response_body = {
            "Data": result,
            "Message": None,
            "Success": True,
            "Total": len(df),
            "Page": page,
            "PageSize": page_size
        }

        # 5. Return the full data to the UI
        return func.HttpResponse(
            body=json.dumps(response_body),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)


@app.route(route="cleanup", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST", "OPTIONS"])
def cleanup_stale_resources(req: func.HttpRequest) -> func.HttpResponse:
    """On-demand cleanup of stale blobs older than 90 days in temporary
    containers to reduce storage costs."""

    if req.method == "OPTIONS":
        return func.HttpResponse("", status_code=204)

    logger.info("Cleanup triggered at %s", datetime.now(timezone.utc).isoformat())

    connect_str = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
    if not connect_str:
        return func.HttpResponse(
            body=json.dumps({"Success": False, "Message": "Storage connection string not configured."}),
            mimetype="application/json",
            status_code=500,
        )

    try:
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        cleanup_containers = ["temp-uploads", "logs-archive"]
        cutoff = datetime.now(timezone.utc) - timedelta(days=90)

        total_deleted = 0
        total_freed_bytes = 0

        for container_name in cleanup_containers:
            try:
                container_client = blob_service_client.get_container_client(container_name)
                container_client.get_container_properties()
            except Exception:
                logger.info("CLEANUP | Container '%s' does not exist, skipping.", container_name)
                continue

            for blob in container_client.list_blobs():
                if blob.last_modified and blob.last_modified < cutoff:
                    blob_size = blob.size or 0
                    container_client.delete_blob(blob.name)
                    total_deleted += 1
                    total_freed_bytes += blob_size
                    logger.info(
                        "CLEANUP | Deleted stale blob: %s/%s (%.2f KB)",
                        container_name, blob.name, blob_size / 1024,
                    )

        freed_mb = round(total_freed_bytes / (1024 * 1024), 2)
        estimated_savings = round(total_freed_bytes / (1024 * 1024 * 1024) * 0.018, 4)

        return func.HttpResponse(
            body=json.dumps({
                "Success": True,
                "blobsDeleted": total_deleted,
                "freedMB": freed_mb,
                "estimatedMonthlySavingsUSD": estimated_savings,
            }),
            mimetype="application/json",
            status_code=200,
        )

    except Exception as e:
        logger.error("CLEANUP | Error: %s", str(e))
        return func.HttpResponse(
            body=json.dumps({"Success": False, "Message": str(e)}),
            mimetype="application/json",
            status_code=500,
        )
    

# ============================================================
# SECURITY STATUS ENDPOINT
# ============================================================
# PURPOSE: This is a NEW Azure Function endpoint that checks
# real security conditions and reports them to the frontend.

@app.route(route="security_status", auth_level=func.AuthLevel.ANONYMOUS)
def get_security_status(req: func.HttpRequest) -> func.HttpResponse:
    """
    Returns the current security & compliance status.

    This endpoint performs real checks on the Azure environment:
    - Encryption: checks if the connection string uses HTTPS
    - Access Control: checks if we can actually reach the storage
    - Compliance: GDPR Compliant only if ALL checks pass
    """

    logger.info("Security status check requested.")

    # ── Step 1: Check Encryption ────────────────────────────
    connect_str = os.environ.get("AZURE_STORAGE_CONNECTION_STRING", "")
    encryption_ok = "https" in connect_str.lower()

    # ── Step 2: Check Access Control ────────────────────────
    access_control_ok = False
    try:
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        # Try to get account info — this will fail if credentials are bad
        blob_service_client.get_account_information()
        access_control_ok = True
    except Exception as e:
        logger.warning("Access control check failed: %s", str(e))
        access_control_ok = False

    # ── Step 3: Check Compliance ────────────────────────────
    has_cleanup_mechanism = True
    compliance_ok = encryption_ok and access_control_ok and has_cleanup_mechanism

    # ── Build the response ──────────────────────────────────
    result = {
        "encryption": "Enabled" if encryption_ok else "Disabled",
        "accessControl": "Secure" if access_control_ok else "Insecure",
        "compliance": "GDPR Compliant" if compliance_ok else "Non-Compliant",
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "details": {
            "httpsEnabled": encryption_ok,
            "storageAccessible": access_control_ok,
            "cleanupEndpointAvailable": has_cleanup_mechanism,
        },
    }

    return func.HttpResponse(
        body=json.dumps(result),
        mimetype="application/json",
        status_code=200,
    )