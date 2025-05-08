from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from typing import Callable
import logging
import traceback
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive=receive)
        start_time = time.time()
        
        async def logging_send(message):
            if message["type"] == "http.response.start":
                status_code = message["status"]
                if status_code >= 400:
                    # Log error responses
                    logger.error(f"Request failed: {request.method} {request.url.path} - Status: {status_code}")
            await send(message)
        
        try:
            await self.app(scope, receive, logging_send)
            # Log successful request
            process_time = time.time() - start_time
            logger.info(f"Request processed: {request.method} {request.url.path} - Time: {process_time:.4f}s")
        except SQLAlchemyError as e:
            # Database errors
            logger.error(f"Database error: {str(e)}")
            error_response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Database error occurred", "type": "database_error"}
            )
            await error_response(scope, receive, send)
        except Exception as e:
            # Unexpected errors
            logger.error(f"Unexpected error: {str(e)}")
            logger.error(traceback.format_exc())
            error_response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "An unexpected error occurred", "type": "server_error"}
            )
            await error_response(scope, receive, send)

def add_error_handling(app):
    """Add all middleware to the app"""
    app.middleware("http")(request_handler)
    return app

async def request_handler(request: Request, call_next: Callable):
    """Middleware for handling request/response cycle with error handling"""
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Database error occurred", "type": "database_error"}
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred", "type": "server_error"}
        ) 