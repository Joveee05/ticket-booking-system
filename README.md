# Event Ticket Booking System API

This project is a RESTful API for managing events, waitlists and tickets/bookings within an ticket booking system. It includes user authentication.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Reasons for Method of Implementation](#reasons-for-method-of-implementation)
- [Error Handling](#error-handling)
- [Potential Improvements](#potential-improvements)
- [License](#license)

## Features

- **Authentication**: Users can register and log in using JWT authentication.
- **User Management**: Read, update, delete users.
- **Event Management**: Create and read events.
- **WaitList Management**: Manage waitingList when tickets for event are sold out.
- **Ticket/Booking Management**: Book tickets, cancel booking.

## Technologies Used

- **Node.js** with **Express**: For building the API.
- **Sequelize**: For ORM and database interaction.
- **MySQL**: As the relational database.
- **TypeScript**: For type-safe code.
- **JWT**: For authentication and authorization.
- **Jest**: For Test Driven Development(TDD)

## Database Schema

The database schema includes the following tables:

- **users**

  - `id`: Integer, Primary Key
  - `email`: String
  - `password`: String (hashed)
  - `createdAt`: Date
  - `updatedAt`: Date

- **events**

  - `id`: Integer, Primary Key
  - `event_name`: String
  - `total_tickets`: Number
  - `available_tickets`: Decimal
  - `status`: String
  - `createdAt`: Date
  - `updatedAt`: Date

- **bookings**

  - `id`: Integer, Primary Key
  - `user_id`: Integer (Foreign Key to users)
  - `event_id`: Integer (Foreign Key to events)
  - `status`: String
  - `createdAt`: Date
  - `updatedAt`: Date

- **waitlists**
- `id`: Integer, Primary Key
- `user_id`: Integer (Foreign Key to users)
- `event_id`: Integer (Foreign Key to events)
- `createdAt`: Date
- `updatedAt`: Date

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Joveee05/ticket-booking-system.git
   ```
2. Navigate to project directory
   ```
   cd ticket-booking-system
   ```
3. Install Dependencies

   ```
   npm install

   ```

4. Set up the environment variables (see below).

5. Start the server

   ```
   npm start
   ```

## Environment Variables

Create .env.development.local, .env.production.local and .env.test.local files in the root of the project with the following variables:

```env
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASS=your-database-password
DB_DATABASE=your-database-name
SECRET_KEY=your-jwt-secret
PORT=3000
LOG_FORMAT = dev | combined
LOG_DIR = ../logs
ORIGIN = *
CREDENTIALS = true
```

## API Endpoints

### Authentication

- POST /api/auth/signup: Register a new user.

- POST /api/auth/login: Log in and receive a JWT token.

### Events

- GET /api/events/status/:event_id: Retrieve a specific event by ID (protected).

- POST /api/events/initialize: Create a new event (protected).

### Bookings

- POST /api/tickets/book: Book ticet(s) for an event (protected).

- POST /api/tickets/cancel: Cancel a ticket booking (protected).

- GET /api/available-tickets/:event_id: Get available tickets for an event (protected).

### WaitingList

- GET /api/waitinglists: Retrieve a list of all users in waiting list (protected).

- POST /api/waitinglists/join-waitlist: Add user to waiting list (protected).

## Reasons for Method of Implementation

1. Scalability - The implementation is designed with scalability in mind, allowing the system to handle various scenarios such as booking multiple tickets for a single user or multiple users, partial booking, and managing a waitlist when tickets are unavailable. By using a flexible approach, the system can easily adapt to increasing load and growing user demands without significant changes to the core logic.

   - Benefits:
     Can handle a large number of booking requests.
     Automatically manages scenarios where partial booking is needed.
     Efficiently adds users to the waitlist when tickets are sold out.

2. Atomic Operations for Consistency - The booking and waitlist processes are implemented in a way that ensures atomicity—either all changes (such as bookings and ticket decrements) are successfully applied, or none are. This ensures that the system maintains data integrity, even in cases where failures occur during the process.

   - Benefits:
     Prevents partial updates that could lead to inconsistencies (e.g., tickets being decremented without bookings).
     Ensures that if an error occurs, the entire operation is rolled back, leaving the system in a consistent state.

3. Handling Complex Scenarios with Graceful - Degradation
   The method handles complex booking scenarios with graceful degradation, meaning that even when tickets are unavailable, the system doesn’t fail; instead, it shifts users to the waitlist. This design ensures that users have a seamless experience, even in edge cases.

- Benefits:
  Users can still engage with the system (via waitlisting) when tickets are unavailable.
  The system automatically adjusts to ticket availability without requiring manual intervention.

4. Middleware for Separation of Concerns - Using middleware to handle ticket availability checks and waitlisting provides a clean separation of concerns. This design keeps the business logic for ticket booking separate from other system functionalities, making the code more modular, reusable, and maintainable.

- Benefits:
  The middleware can be reused across different routes where ticket availability needs to be checked.
  It simplifies the core booking logic by handling ticket validation and waitlisting in a separate layer.

5. Preventing Duplicate Waitlist Entries - The implementation includes logic to ensure that users are not added to the waitlist multiple times, preventing duplication and keeping the waitlist clean and accurate. This approach avoids user frustration caused by being repeatedly added to the waitlist.

- Benefits:
  Ensures that no user is added to the waitlist more than once.
  Improves the efficiency of waitlist management.

6. Modular and Extensible Design - The code is designed to be modular and extensible, with helper functions (like addUserToWaitlist) and reusable components (like the middleware). This modularity allows for easy extension of the system, such as adding new features or modifying existing behavior without requiring significant changes to the codebase.

- Benefits:
  The system can be extended with new features (e.g., priority waitlisting, advanced booking options) without rewriting the core logic.
  Easy to maintain and test, as each component is isolated and can be independently developed.

7. Transaction-Safe Operations - The use of transactions in the database ensures that operations like decrementing available tickets and adding bookings happen within a single, atomic unit of work. This prevents scenarios where tickets might be decremented without corresponding bookings being made, or vice versa.

- Benefits:
  Ensures data integrity in case of failures.
  Prevents race conditions where multiple users attempt to book the same ticket simultaneously.

8. Partial Booking Support - The system supports partial booking, meaning users can still purchase available tickets if their requested quantity exceeds the available tickets. The remaining tickets will automatically be added to the waitlist. This provides flexibility to users and ensures they can still make bookings even in low-availability scenarios.

- Benefits:
  Provides flexibility by allowing users to book tickets for available slots while automatically waitlisting the remaining requests.
  Ensures that users don’t leave the system empty-handed, improving user satisfaction.

## Error Handling

The API uses standard HTTP status codes for error handling. Common error responses include:

- 400 Bad Request: The request was invalid or cannot be otherwise served.

- 401 Unauthorized: Authentication is required and has failed or has not yet been provided.

- 403 Forbidden: The request was valid, but the server is refusing action. The user might not have the necessary permissions.

- 404 Not Found: The requested resource could not be found.

- 409 Conflict: The requested resource already exists.

- 500 Internal Server Error: An error occurred on the server.

## Potential Improvements

- Role Based Access: Implement Role-Based Access Control (RBAC) at a Granular Level for adding events, total_tickets, cancelling events.

- Implement Caching

  - Current State: No caching is implemented.
  - Improvement: Use caching for frequently accessed resources to reduce database load and improve response times.

- Optimize Database Queries

## Licence

This project is licensed under the MIT License.
