# 🚀 Getting Started

## 1. Start the Services

Spin up the required services using Docker Compose:

```bash
docker compose up -d
```

## 2. Initialize Weaviate Schema

Once the containers are running, initialize the Weaviate schema:

```bash
npm run init:schema
```

## 3. Run the Development Server

Now, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
