# Aura: The Climate Resilience Hub 🌦️

Aura is a mobile-first Progressive Web App (PWA) designed to empower communities to prepare for, respond to, and recover from climate-related disasters. With a focus on offline accessibility, Aura ensures that critical information is available even when network infrastructure fails, providing a vital lifeline for vulnerable populations during emergencies.

This project was developed for the Climate Resilience Hack.

**[Live Demo](https://codestorm-frontend.onrender.com/)** *(Link to your live Render deployment)*

-----

## \#\# Problem Statement 💡

Climate change is increasing the frequency and intensity of extreme weather events, from floods in Bhubaneswar to heatwaves across the globe. Local communities, especially underserved populations, are often the hardest hit and slowest to recover. Access to timely, actionable information before, during, and after a disaster is crucial for building community resilience, but this access is often cut off when it's needed most.

Aura bridges this gap by providing a reliable, offline-first platform for disaster management.

-----

## \#\# Features ✨

Aura is structured around the three phases of disaster management:

### **Prepare**

  * **Instruction Guides:** Step-by-step instructions on how to prepare for specific local disasters (e.g., cyclones, floods).
  * **Emergency Kit Checklist:** A comprehensive checklist of essential items for a go-bag, categorized for easy packing.
  * **Latest News:** Curated news alerts and weather warnings from official sources.

### **Respond**

  * **Offline Shelter Map:** An interactive map showing the location and status of nearby emergency shelters, designed to work without an internet connection.
  * **Emergency Contacts:** A quick-access list of local and national emergency service numbers.
  * **SOS Alert:** A simple SOS feature to log a user's location for first responders (future implementation).

### **Recover**

  * **Aid Request Portal:** A simple form for affected individuals to request specific aid like food, water, or medical supplies.
  * **Volunteer & NGO Directory:** Contact information for local NGOs and government agencies involved in relief efforts.

-----

## \#\# Tech Stack 🔧

| Category      | Technology                                    |
| :------------ | :-------------------------------------------- |
| **Frontend** | **Vite**, **HTML5**, **CSS3**, **JavaScript** (Vanilla JS) |
| **Backend** | **Flask** (Python)                             |
| **Database** | **Supabase** (PostgreSQL)                     |
| **Deployment**| **Render** |

-----

## \#\# Getting Started 🚀

Follow these instructions to set up the project locally for development and testing.

### **Prerequisites**

  * [Git](https://git-scm.com/)
  * [Python 3.8+](https://www.python.org/downloads/)
  * [Node.js and npm](https://nodejs.org/en/)

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### **2. Backend Setup**

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Create the .env file (see section below)
cp .env.example .env

# Run the Flask server
python run.py
```

The backend will now be running at `http://127.0.0.1:5000`.

### **3. Frontend Setup**

```bash
# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
npm install

# Run the Vite development server
npm run dev
```

The frontend will now be accessible at `http://127.0.0.1:5173` (or another port if 5173 is busy).

-----

## \#\# Environment Variables

The backend requires a `.env` file to connect to the Supabase database. Create a file named `.env` in the `/backend` directory and add the following variables:

```
# /backend/.env

# Supabase Credentials
SUPABASE_URL="your_supabase_project_url"
SUPABASE_KEY="your_supabase_anon_key"
```

-----

## \#\# Deployment

This application is configured for easy deployment on **Render**. The `render.yaml` file (if included) or manual service setup on Render will handle the build and start commands for both the frontend (as a Static Site) and the backend (as a Web Service). Remember to set the environment variables in the Render dashboard.
