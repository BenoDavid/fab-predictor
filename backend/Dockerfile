# ========= Base (Debian 11 slim) =========
FROM python:3.11-slim-bullseye

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg2 apt-transport-https ca-certificates \
    unixodbc unixodbc-dev gcc g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

# Add Microsoft sources + install ODBC Driver 18
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 && \
    rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /app

# Copy ONLY requirements
COPY requirements.txt /app/requirements.txt

# Upgrade pip tooling
RUN pip install --upgrade pip setuptools wheel

# Configure pip trust
RUN mkdir -p /etc/pip && \
    printf "[global]\ntrusted-host = pypi.org\n               files.pythonhosted.org\n               pypi.python.org\n" > /etc/pip/pip.conf

# Install dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# No `COPY app ...` — code will come from host

# Expose FastAPI port
EXPOSE 8000

# Env placeholders
ENV MSSQL_SERVER=123456 \
    MSSQL_DATABASE=fab \
    MSSQL_USERNAME=fab \
    MSSQL_PASSWORD=""

# Run script
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh

CMD ["/app/run.sh"]