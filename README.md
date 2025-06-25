# Nigerian Universities API

A simple Node.js + Express REST service that scrapes the [National Universities Commission (NUC)](https://www.nuc.edu.ng/) website for up-to-date information about Nigerian universities (Federal, State & Private) and exposes convenient JSON endpoints.

![Node.js](https://img.shields.io/badge/Node.js-14%2B-brightgreen)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨  Features

* Live scraping – data is fetched at server start-up (≈300 universities) so you always serve fresh info.
* Rich query support – filter by state, city, type or free-text **search**.
* Clean, predictable JSON schema ready for front-end or mobile consumption.
* Zero external DB – everything runs in-memory, perfect for demos & learning purposes.

---

## 📑  API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/universities` | List all universities. Optional query params: `state`, `city`, `type` (`Federal\|State\|Private`), `search` (partial match). |
| GET | `/universities/city/:city` | Universities located in a city. |
| GET | `/universities/state/:state` | Universities located in a state. |
| GET | `/universities/private` | All private universities. |
| GET | `/universities/private/state/:state` | Private universities within a state. |
| GET | `/universities/:identifier` | Details by **full name** or **abbreviation** (e.g. `UNILAG`). |

### Sample Response
```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "name": "University of Lagos",
        "state": "Lagos",
        "city": "Lagos",
        "abbreviation": "UNILAG",
        "vice_chancellor": "Prof. Folasade T Ogunsola",
        "year_of_establishment": "1962",
        "website": "https://www.unilag.edu.ng",
        "university_type": "Federal"
      }
    ]
  }
}
```

---

## 🚀  Quick Start

1. **Clone** the repository
   ```bash
   git clone https://github.com/your-org/nigerian-universities-api.git
   cd nigerian-universities-api
   ```
2. **Install** dependencies
   ```bash
   npm install
   ```
3. **Run** in production mode
   ```bash
   npm start
   ```
   or in dev mode with auto-reload:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000/api/universities` in your browser or use the examples below.

### cURL examples
```bash
# All private universities in Lagos state
curl "http://localhost:3000/api/universities/private/state/lagos"

# Search for technology-focused universities
curl "http://localhost:3000/api/universities?search=technology"
```

---

## 🗂  Project Structure
```
.
├── server.js         # Express server & scraping logic
├── package.json      # Project metadata & scripts
└── README.md         # Docs (you are here)
```

---

## 🤝  Contributing
Pull requests are welcome! If you'd like to add caching, pagination, tests or new endpoints, please open an issue first to discuss your ideas.

1. Fork the repo & create your branch: `git checkout -b feature/foo`  
2. Commit your changes: `git commit -m 'Add amazing feature'`  
3. Push to the branch: `git push origin feature/foo`  
4. Open a Pull Request.

---

## 📜  License

This project is licensed under the [MIT License](LICENSE).

---

## 🙋‍♂️  FAQ

**The port (3000) is already in use when running with nodemon!**  
You probably have another instance already running. Stop it (Ctrl-C) or change the `PORT` environment variable before starting:
```bash
PORT=4000 npm start
```

**Does the API automatically refresh?**  
Data is refreshed only at server start-up. Restart the server to fetch the latest NUC list.

---

### Acknowledgements
Data sourced from the public pages of Nigeria's National Universities Commission (NUC). 