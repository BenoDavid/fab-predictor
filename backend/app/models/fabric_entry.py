from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Date

class Base(DeclarativeBase):
    pass

class FabricConsumption(Base):
    __tablename__ = "fact_fabric_consumption"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    style: Mapped[str | None] = mapped_column(String(100))
    po: Mapped[str | None] = mapped_column(String(100))
    color: Mapped[str | None] = mapped_column(String(100))
    fabric_type: Mapped[str | None] = mapped_column(String(100))

    buyer: Mapped[str | None] = mapped_column(String(100))
    season: Mapped[str | None] = mapped_column(String(100))
    supplier: Mapped[str | None] = mapped_column(String(100))
    factory: Mapped[str | None] = mapped_column(String(100))
    po_date: Mapped[Date | None] = mapped_column(Date)

    order_qty: Mapped[float | None] = mapped_column(Float)
    unit: Mapped[str | None] = mapped_column(String(20))  # 'meters' or 'yards'
    actual_consumption_total: Mapped[float | None] = mapped_column(Float)

    gsm: Mapped[float | None] = mapped_column(Float)
    width_mm: Mapped[float | None] = mapped_column(Float)
    shrinkage_warp_pct: Mapped[float | None] = mapped_column(Float)
    shrinkage_weft_pct: Mapped[float | None] = mapped_column(Float)
    marker_efficiency_pct: Mapped[float | None] = mapped_column(Float)
    wash_type: Mapped[str | None] = mapped_column(String(50))

    # Optional derived
    # If your table has this:
    # color_family: Mapped[str | None] = mapped_column(String(50))