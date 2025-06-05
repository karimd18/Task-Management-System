# Task Management System

An ASP.NET Core Web API and MVC-based Task Management System that enables users to create, assign, track, and manage tasks within teams. The system leverages Entity Framework Core for data persistence, AutoMapper for object mapping between data models and DTOs, and SQL Server (or SQLite) as the database. A clean, RESTful API serves data to the MVC frontend, which provides an intuitive interface for managing tasks, teams, and task statuses.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Usage](#usage)
8. [Project Structure](#project-structure)
9. [Contributing](#contributing)
10. [License](#license)
11. [Contact](#contact)

---

## Project Overview

The Task Management System is designed to help organizations and teams streamline their workflow by providing:

- User authentication and authorization (roles: Admin, User).
- CRUD operations for tasks, teams, and task statuses.
- Assignment of tasks to team members.
- Task status tracking (e.g., To Do, In Progress, Done).
- RESTful Web API built with ASP.NET Core.
- MVC frontend consuming the API for a seamless user experience.

---

## Features

- **User Management**:
  - Registration, login, and role-based access control.
  - User profiles with basic information.

- **Task Management**:
  - Create, read, update, and delete tasks.
  - Assign tasks to users and teams.
  - Set due dates and priority levels.
  - Filter tasks by status, assigned user, or team.

- **Team Management**:
  - Create and manage teams.
  - Add or remove members from teams.
  - View tasks by team.

- **Task Status Workflow**:
  - Predefined status categories (To Do, In Progress, Completed).
  - Ability to add custom status if needed.

- **RESTful API**:
  - Controllers for Tasks, Teams, Users, and Statuses.
  - JSON-based endpoints following best practices.
  - Integration with AutoMapper to map between entities and DTOs.

- **MVC Frontend**:
  - Razor views for displaying dashboards, lists, and forms.
  - jQuery/AJAX integration for asynchronous operations.
  - Bootstrap 5 for responsive UI styling.

---

## Tech Stack

- **Backend**:
  - ASP.NET Core 9.0 Web API
  - Entity Framework Core (EF Core) with Code-First migrations
  - AutoMapper
  - SQL Server (or SQLite for development/testing)
  - FluentValidation (optional, for model validation)
  - JWT or ASP.NET Identity (if implemented for authentication)

- **Frontend**:
  - ASP.NET Core MVC (Razor views)
  - Bootstrap 5 for styling
  - jQuery and AJAX for dynamic updates

- **Tools & Utilities**:
  - Visual Studio 2022 / Visual Studio Code
  - Postman (for API testing)
  - Git for version control

---

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (or SQLite if preferred)
- [Node.js and npm](https://nodejs.org/) (optional, if managing frontend assets separately)
- [Git](https://git-scm.com/)

---

## Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/karimd18/Task-Management-System.git
   cd Task-Management-System
   ```

2. **Restore NuGet packages**  
   ```bash
   cd TaskManagement.Api
   dotnet restore
   ```

3. **Apply database migrations**  
   Ensure the connection string in `appsettings.json` is configured (see [Configuration](#configuration)).  
   ```bash
   dotnet ef database update
   ```

4. **Run the Web API**  
   ```bash
   dotnet run --project TaskManagement.Api
   ```
   The API will launch at `https://localhost:5001` (or the configured port).

5. **Run the MVC Frontend**  
   In a new terminal:
   ```bash
   cd TaskManagement.Web
   dotnet run
   ```
   Access the frontend at `https://localhost:5000`.

---

## Configuration

- **Connection Strings**:  
  In `TaskManagement.Api/appsettings.json`, update the `DefaultConnection` entry under `ConnectionStrings` to point to your SQL Server or SQLite database.  
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=TaskDb;Trusted_Connection=True;"
  }
  ```

- **JWT / Identity (if used)**:  
  Configure JWT settings (Issuer, Audience, Key) or Identity settings in `appsettings.json` and `Program.cs`.

- **API Base URL**:  
  In the MVC project (`TaskManagement.Web`), ensure that the base API URL in the `appsettings.json` or `_Layout.cshtml` matches the running API endpoint.

---

## Usage

1. **Register a new user**  
   Visit `/Account/Register` on the MVC frontend and create an account.

2. **Login**  
   Authenticate via `/Account/Login` and access the dashboard.

3. **Create Teams**  
   Navigate to `Teams` and add a new team. Invite or assign users to the team.

4. **Manage Tasks**  
   Go to `Tasks`:
   - Click “Create Task”
   - Fill in title, description, due date, priority, and assign to a user or team.
   - Save and view tasks in the list.

5. **Update Task Status**  
   Edit an existing task to change its status from To Do → In Progress → Completed.

6. **View Reports**  
   Optionally, view summary dashboards or export task lists (if implemented).

---

## Project Structure

```
Task-Management-System/
│
├── TaskManagement.Api/         # ASP.NET Core Web API project
│   ├── Controllers/            # API controllers (Tasks, Teams, Users, Status)
│   ├── Data/                   # DbContext and entity models
│   ├── DTOs/                   # Data Transfer Objects (for API requests/responses)
│   ├── Mappings/               # AutoMapper profiles
│   ├── Migrations/             # EF Core migrations
│   ├── Services/               # Business logic and repository classes
│   ├── appsettings.json        # Configuration (connection strings, JWT, etc.)
│   └── Program.cs              # Application entry point
│
└── TaskManagement.Web/         # ASP.NET Core MVC frontend project
    ├── Controllers/            # MVC controllers
    ├── Models/                 # ViewModels or frontend-specific models
    ├── Views/                  # Razor views (Layouts, partials, pages)
    ├── wwwroot/                # Static assets (CSS, JS, images)
    ├── appsettings.json        # Frontend configuration (API URL)
    └── Program.cs              # MVC app entry point
```

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a new branch:  
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Make your changes and commit them with descriptive messages.
4. Push your branch to GitHub:  
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request against the `main` branch of the original repository.

Please ensure code is clean, well-documented, and passes existing tests (if any).

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact

**Karim Doueik**  
- GitHub: [karimd18](https://github.com/karimd18)  
- Email: karim.doueik@example.com  

Feel free to open issues or contact me with suggestions and questions.  
