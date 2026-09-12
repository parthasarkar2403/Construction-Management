from flask_sqlalchemy import SQLAlchemy

# This "db" object is shared between app.py and models.py
db = SQLAlchemy()


class Project(db.Model):
    """
    One row in this table = one construction project.
    This is the very first table of the ERP. More tables
    (Workers, Vendors, Equipment, etc.) will be added later,
    one module at a time.
    """
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    client_name = db.Column(db.String(200))
    location = db.Column(db.String(200))
    # Planning | In Progress | On Hold | Completed
    status = db.Column(db.String(50), default="Planning")
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    budget = db.Column(db.Numeric(14, 2), default=0)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(
        db.DateTime, server_default=db.func.now(), onupdate=db.func.now()
    )

    def to_dict(self):
        """Convert this database row into a plain dictionary,
        so Flask can turn it into JSON for the frontend."""
        return {
            "id": self.id,
            "name": self.name,
            "client_name": self.client_name,
            "location": self.location,
            "status": self.status,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "budget": float(self.budget) if self.budget is not None else 0,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
