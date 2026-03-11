# how to run this project
# and python version above 3.10 

# for backend
1. cd backend
2. python -m venv venv
3. venv\Scripts\activate
4. uvicorn app.main:app --reload

# for frontend
1. cd frontend
2. npm install
3. npm run dev

# Knowledge base refresh
# New files placed in backend/college_data or backend/temp_uploads are auto-detected.
# Restart command is not required just for index refresh; the backend rebuilds index when files change.
