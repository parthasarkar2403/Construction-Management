from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

from config import Config
from models import db, Project


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Render sometimes gives a URL that starts with "postgres://"
    # but SQLAlchemy needs "postgresql://". This line fixes that automatically.
    uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if uri.startswith("postgres://"):
        app.config["SQLALCHEMY_DATABASE_URI"] = uri.replace(
            "postgres://", "postgresql://", 1
        )

    # Allow the React frontend (running on a different address) to call this API
    CORS(app)

    db.init_app(app)

    # Create the "projects" table automatically if it doesn't exist yet
    with app.app_context():
        db.create_all()

    # ---------------------------------------------------------------
    # Basic routes to check the server is alive
    # ---------------------------------------------------------------
    @app.route("/")
    def home():
        return {"message": "Construction ERP API is running"}

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    # ---------------------------------------------------------------
    # PROJECTS - CRUD API
    # CRUD = Create, Read, Update, Delete
    # ---------------------------------------------------------------

    # READ (all projects, with optional search & status filter)
    # Example: GET /api/projects?search=tower&status=In Progress
    @app.route("/api/projects", methods=["GET"])
    def get_projects():
        search = request.args.get("search", "").strip()
        status = request.args.get("status", "").strip()

        query = Project.query
        if search:
            query = query.filter(Project.name.ilike(f"%{search}%"))
        if status:
            query = query.filter(Project.status == status)

        projects = query.order_by(Project.created_at.desc()).all()
        return jsonify([p.to_dict() for p in projects])

    # READ (a single project by id)
    @app.route("/api/projects/<int:project_id>", methods=["GET"])
    def get_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify(project.to_dict())

    # CREATE (add a new project)
    @app.route("/api/projects", methods=["POST"])
    def create_project():
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()

        if not name:
            return jsonify({"error": "Project name is required"}), 400

        project = Project(
            name=name,
            client_name=data.get("client_name"),
            location=data.get("location"),
            status=data.get("status", "Planning"),
            start_date=parse_date(data.get("start_date")),
            end_date=parse_date(data.get("end_date")),
            budget=data.get("budget", 0),
            description=data.get("description"),
        )
        db.session.add(project)
        db.session.commit()
        return jsonify(project.to_dict()), 201

    # UPDATE (edit an existing project)
    @app.route("/api/projects/<int:project_id>", methods=["PUT"])
    def update_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404

        data = request.get_json() or {}

        if "name" in data:
            if not data["name"].strip():
                return jsonify({"error": "Project name cannot be empty"}), 400
            project.name = data["name"].strip()

        for field in ["client_name", "location", "status", "description"]:
            if field in data:
                setattr(project, field, data[field])

        if "start_date" in data:
            project.start_date = parse_date(data["start_date"])
        if "end_date" in data:
            project.end_date = parse_date(data["end_date"])
        if "budget" in data:
            project.budget = data["budget"]

        db.session.commit()
        return jsonify(project.to_dict())

    # DELETE (remove a project)
    @app.route("/api/projects/<int:project_id>", methods=["DELETE"])
    def delete_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404

        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": "Project deleted successfully"})

    return app


def parse_date(value):
    """Turns a 'YYYY-MM-DD' string from the frontend into a real date."""
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
