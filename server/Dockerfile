# syntax=docker/dockerfile:1.4

FROM --platform=$BUILDPLATFORM python:3.10-slim AS builder

WORKDIR /app

# Install dependencies required for MediaPipe
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt \
    && pip3 install gunicorn

COPY . /app

EXPOSE 5000


CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:application"]