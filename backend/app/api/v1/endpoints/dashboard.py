from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.project import Project

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    total_projects = (
        db.query(func.count(Project.id)).scalar() or 0
    )

    return {
        "total_projects": total_projects,
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,

        "coverage": {
            "value": 0,
            "delta": "Awaiting test data"
        },

        "stats": [
            {
                "key": "Projects",
                "value": total_projects,
                "icon": "database",
                "sub": "Registered projects",
                "tone": "up"
            },
            {
                "key": "Total Tests",
                "value": 0,
                "icon": "flask-conical",
                "sub": "No test data yet",
                "tone": "up"
            },
            {
                "key": "Passed",
                "value": 0,
                "icon": "dot-blue",
                "sub": "0 passed",
                "tone": "pass"
            },
            {
                "key": "Failed",
                "value": 0,
                "icon": "dot-red",
                "sub": "0 failed",
                "tone": "fail"
            },
            {
                "key": "Workflows",
                "value": 0,
                "icon": "workflow",
                "sub": "No workflows yet",
                "tone": "up"
            },
            {
                "key": "Pass Rate",
                "value": 0,
                "kind": "rate",
                "pass": 0,
                "fail": 0,
                "icon": "activity",
                "sub": "Awaiting test data",
                "tone": "up"
            }
        ],

        "runs": [],

        "execution": {
            "24H": [],
            "7D": [],
            "30D": [],
            "90D": []
        },

        "insights": [
            {
                "type": "System",
                "tone": "pass",
                "icon": "info",
                "time": "Now",
                "text": "Dashboard connected. Upload a recording and generate test cases to begin testing."
            }
        ],

        "pipeline": [
            ["Video Processing", "Ready"],
            ["OCR Analysis", "Ready"],
            ["AI Test Generation", "Ready"],
            ["Test Execution", "Awaiting tests"]
        ],

        "shards": {
            "used": 0,
            "total": 1
        },

        "recent_activity": []
    }