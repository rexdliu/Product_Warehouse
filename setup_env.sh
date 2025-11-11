#!/bin/bash

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo "Created .env.production from .env.production.example"
fi

echo "Environment files checked and created if needed."